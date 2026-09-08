import { generateObjectId } from '../db/schema';
import ExcelJS from 'exceljs';
import Papa from 'papaparse';
import { Parser } from '@json2csv/plainjs';
import { OwnerType } from '../enums/user.enum';
import {
  banksCollection,
  checkImportCollection,
  checkImportRowCollection,
  checksCollection,
} from '../models/dbCollections';
import { AttachmentService } from './attachments.service';
import { EntityType } from '../models/attachment.model';
import type {
  ImportFile,
  CancelImportRequest,
  ListImportsRequest,
  ParsedRow,
  FinalizeImportRequest,
  GetImportRequest,
  DownLoadImportRequest,
  GetImportRowsRequest,
  ExportRequest,
  ValidateRowRequest,
  GetBankRequest,
  ValidationFields,
  ValidationResult,
  ValidateCheckNumberRequest,
  GetCheckRequest,
  ValidatePayeeRequest,
  SaveRowRequest,
  BaseInfo,
  SubmitRowRequest,
  PreLoadCacheRequest,
} from '../types/checkImports';
import { ICheckImport, ICheckImportRow } from './checkImport.schema';
import { getNextAvailableCheckNumber } from './banks.service';
import { ImportCacheService } from '../utils/checkImportCacheService';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CheckImportService {
  private checkImportCache = new ImportCacheService();
  private MAX_ROWS = 1000;
  private SUPPORTED_MIME_TYPES = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  async createCheckImport({
    file,
    ownerType,
    ownerId,
    userId,
    bankId,
  }: {
    file: ImportFile;
    ownerType: OwnerType;
    ownerId: string;
    userId: string;
    bankId: string;
  }) {
    if (!this.SUPPORTED_MIME_TYPES.includes(file.mimetype)) {
      throw new Error('Unsupported file type');
    }

    await this.checkImportCache.loadBanks({
      bankIds: [bankId],
      ownerId,
      ownerType,
    });

    const bank = await this.checkImportCache.getBank({
      bankId,
      ownerId,
      ownerType,
    });

    if (!bank) throw new Error('Bank not found');

    const checkImport = await checkImportCollection.create({
      ownerType,
      ownerId,
      createdBy: userId,
      fileName: file.originalname,
      status: 'In Review',
      bankAccountId: bankId,
      rowCounts: {
        total: 0,
        valid: 0,
        invalid: 0,
        submitted: 0,
        skipped: 0,
      },
    });

    try {
      await AttachmentService.createAttachments({
        files: [file],
        entityType: EntityType.CHECK_IMPORT,
        entityId: checkImport._id,
        ownerType,
        ownerId,
        uploadedBy: userId,
      });

      const rows = await this.parseFile(file.buffer, file.mimetype);

      await this.checkImportCache.loadPayees({
        ownerId,
        ownerType,
        payees: rows.map((r) => ({ name: r.payeeName, payeeId: undefined })),
      });

      if (rows.length === 0) {
        throw new Error('No data found in file');
      }
      if (rows.length > this.MAX_ROWS) {
        throw new Error(`Maximum ${this.MAX_ROWS} rows allowed`);
      }

      const rowDocuments = await this.processRows({
        rows,
        importId: checkImport._id,
        ownerType,
        ownerId,
        userId,
      });

      await this.checkImportCache.loadCheckNumbers({
        bankId,
        ownerId,
        ownerType,
        checkNumbers: rowDocuments.map((r) => r.finalCheckNumber),
      });

      const validatedRows = await Promise.all(
        rowDocuments?.map((doc) =>
          this.validateRow({
            row: doc,
            bankId,
            checkForDuplicateCheckNumber: true,
          })
        )
      );

      await checkImportRowCollection.insertMany(validatedRows);

      const validCount = validatedRows.filter(
        (r) => r.state === 'valid'
      ).length;
      const invalidCount = validatedRows.filter(
        (r) => r.state === 'invalid'
      ).length;

      checkImport.rowCounts = {
        total: rowDocuments.length,
        valid: validCount,
        invalid: invalidCount,
        submitted: 0,
        skipped: 0,
      };
      await checkImport.save();

      const populatedCheckImport = await checkImport.populate(
        'bankAccountId',
        'bankName bankPreferences.checkNoGeneration'
      );

      return {
        checkImport: {
          ...populatedCheckImport.toObject(),
          bankDetails: populatedCheckImport?.bankAccountId,
        },
      };
    } catch (error) {
      await checkImportCollection.deleteOne({ _id: checkImport._id });

      throw error;
    }
  }

  async cancelImport({ importId, ownerType, ownerId }: CancelImportRequest) {
    try {
      const checkImportRows = await this.getRowsByImport({
        importId,
        ownerId,
        ownerType,
      });

      if (checkImportRows.some((row) => row.state === 'submitted')) {
        throw new Error(
          'This import cant be canceled, its rows are already submitted'
        );
      }

      const importRecord = await checkImportCollection
        .findOneAndUpdate(
          {
            _id: importId,
            ownerType,
            ownerId,
          },
          {
            $set: {
              status: 'Canceled',
            },
          }
        )
        .lean();
      return importRecord;
    } catch (error) {
      throw error;
    }
  }

  async listImports({ ownerType, ownerId, status }: ListImportsRequest) {
    try {
      const query: Record<string, any> = {
        ownerType,
        ownerId,
      };

      if (status) {
        query.status = status;
      }

      const imports = await checkImportCollection
        .find(query)
        .populate('bankAccountId', 'bankName bankPreferences.checkNoGeneration')
        .sort({ createdAt: -1 })
        .lean();

      const final = imports.map(({ bankAccountId, ...rest }) => ({
        bankDetails: bankAccountId,
        ...rest,
      }));

      return final;
    } catch (error) {
      throw error;
    }
  }

  async finalizeImport({
    importId,
    ownerId,
    ownerType,
  }: FinalizeImportRequest) {
    try {
      const currentImport = await this.getCurrentImport({
        importId,
        ownerId,
        ownerType,
      });

      const currentRows = await this.getRowsByImport({
        importId,
        ownerId,
        ownerType,
      });

      const validatedRows = await Promise.all(
        currentRows?.map((doc) =>
          this.validateRow({
            row: doc,
            bankId: currentImport.bankAccountId.toString(),
          })
        )
      );

      const allRowsProcessed = validatedRows.every(
        (item) => item.state === 'skipped' || item.state === 'submitted'
      );

      if (!allRowsProcessed) {
        throw new Error(
          `Import: ${currentImport._id} can't be finalized. Not all rows are skipped or submitted.`
        );
      }

      return await checkImportCollection.findOneAndUpdate(
        { ownerId, ownerType, _id: importId },
        { status: 'Completed' }
      );
    } catch (error) {
      throw error;
    }
  }

  async downloadImportFile({
    ownerId,
    ownerType,
    importId,
  }: DownLoadImportRequest) {
    try {
      const attachment = await AttachmentService.getAttachmentsByEntity({
        entityId: importId,
        ownerId: ownerId as string,
        ownerType,
        entityType: EntityType.CHECK_IMPORT,
      });

      if (!attachment.length) {
        throw new Error('Attachment not found');
      }

      const url = await AttachmentService.downloadAttachment({
        attachmentId: attachment[0]._id.toString(),
        ownerType,
        userId: ownerId as string,
      });

      return url.url;
    } catch (error) {
      throw error;
    }
  }

  async exportRowsByImportId({ importId, ownerId, ownerType }: ExportRequest) {
    try {
      const rows = await this.getRowsByImport({ importId, ownerId, ownerType });

      const processedRows = rows.map((row) => ({
        ImportId: row.importId?.toString(),
        OwnerType: row.ownerType,
        OwnerId: row.ownerId?.toString(),
        RowNumber: row.rowNumber,
        OriginalCheckNumber: row.originalCheckNumber,
        OriginalAmount: row.originalAmount,
        OriginalPayeeName: row.originalPayeeName,
        OriginalNote: row.originalNote,
        OriginalInvoiceId: row.originalInvoiceId,
        FinalCheckNumber: row.finalCheckNumber,
        FinalAmount: row.finalAmount,
        FinalPayeeName: (row.finalPayeeId as any)?.name || '',
        SuggestedPayeeName: (row.suggestedPayeeId as any)?.name || '',
        FinalNote: row.finalNote,
        FinalInvoiceId: row.finalInvoiceId,
        ValidationErrors: row.validationErrors,
        State: row.state,
        CheckId: (row.checkId as any)?.checkNumber || '',
        SubmittedAt: row.submittedAt
          ? row.submittedAt.toISOString().split('T')[0]
          : '',
        SubmittedBy: (row.submittedBy as any)?.email || '',
        CreatedAt: row.createdAt
          ? row.createdAt.toISOString().split('T')[0]
          : '',
        UpdatedAt: row.updatedAt
          ? row.updatedAt.toISOString().split('T')[0]
          : '',
      }));

      const fields = [
        { label: 'Import ID', value: 'ImportId' },
        { label: 'Owner Type', value: 'OwnerType' },
        { label: 'Owner ID', value: 'OwnerId' },
        { label: 'Row Number', value: 'RowNumber' },
        { label: 'Original Check Number', value: 'OriginalCheckNumber' },
        { label: 'Original Amount', value: 'OriginalAmount' },
        { label: 'Original Payee Name', value: 'OriginalPayeeName' },
        { label: 'Original Note', value: 'OriginalNote' },
        { label: 'Original Invoice ID', value: 'OriginalInvoiceId' },
        { label: 'Final Check Number', value: 'FinalCheckNumber' },
        { label: 'Final Amount', value: 'FinalAmount' },
        { label: 'Final Payee Name', value: 'FinalPayeeName' },
        { label: 'Suggested Payee Name', value: 'SuggestedPayeeName' },
        { label: 'Final Note', value: 'FinalNote' },
        { label: 'Final Invoice ID', value: 'FinalInvoiceId' },
        { label: 'Validation Errors', value: 'ValidationErrors' },
        { label: 'State', value: 'State' },
        { label: 'Check ID', value: 'CheckId' },
        { label: 'Submitted At', value: 'SubmittedAt' },
        { label: 'Submitted By', value: 'SubmittedBy' },
        { label: 'Created At', value: 'CreatedAt' },
        { label: 'Updated At', value: 'UpdatedAt' },
      ];

      const json2csvParser = new Parser({ fields });
      const csvData = json2csvParser.parse(processedRows);

      const getCurrentImport = await this.getImportById(importId);

      return { csvData, fileName: getCurrentImport.fileName };
    } catch (error) {
      throw error;
    }
  }

  async validateRow({
    row,
    checkForDuplicateCheckNumber = true,
    bankId,
  }: ValidateRowRequest): Promise<ICheckImportRow> {
    try {
      const { ownerId, ownerType } = row;

      // Skip validation for already submitted or skipped rows
      if (row.state === 'skipped' || row.state === 'submitted') {
        return row;
      }

      // Ensure validationErrors is a plain object (not Map, not Array)
      if (
        typeof row.validationErrors !== 'object' ||
        row.validationErrors === null ||
        row.validationErrors instanceof Map ||
        Array.isArray(row.validationErrors)
      ) {
        row.validationErrors = {} as any;
      }

      const validationResult: Partial<
        Record<ValidationFields, ValidationResult>
      > = {};

      // Perform validations
      validationResult.amount = this.validateFinalAmount(
        row.finalAmount ?? +row.originalAmount
      );

      validationResult.checkNumber = await this.validateFinalCheckNumber({
        ownerId,
        ownerType,
        checkNumber: row.finalCheckNumber ?? +row.originalCheckNumber,
        bankId,
        checkForDuplicateCheckNumber,
        importId: row.importId?.toString(),
      });

      validationResult.payeeId = await this.validatePayeeId({
        ownerId,
        ownerType,
        payeeId: row.finalPayeeId ?? row.suggestedPayeeId,
        payeeName: row.originalPayeeName,
      });

      // Apply errors to row.validationErrors
      for (const field of Object.keys(validationResult) as ValidationFields[]) {
        const result = validationResult[field];
        row.validationErrors[field] = result?.errors ?? [];
      }

      // Set state based on presence of any errors
      const hasErrors = Object.values(row.validationErrors).some(
        (errors) => Array.isArray(errors) && errors.length > 0
      );

      row.state = hasErrors ? 'invalid' : 'valid';

      return row;
    } catch (error) {
      console.error('Error in validateRow:', error);
      throw error;
    }
  }

  async saveRows({ importId, ownerId, ownerType, rows }: SaveRowRequest) {
    try {
      // 1. Fetch current check import
      const checkImport = await this.getCurrentImport({
        importId,
        ownerId,
        ownerType,
      });
      const bankId = checkImport.bankAccountId.toString();

      // 2. Preload necessary cache
      await this.preLoadCache({
        bankId,
        ownerId,
        ownerType,
        checkNumbers: rows.map((r) => r.finalCheckNumber),
        payees: rows.map((r) => ({
          name: r.originalPayeeName,
          payeeId: r.finalPayeeId,
        })),
      });

      // 3. Fetch all relevant existing rows in one go
      const existingRows = await checkImportRowCollection
        .find({
          _id: { $in: rows.map((r) => r._id) },
          ownerId,
          ownerType,
        })
        .lean();

      const existingMap = new Map<string, any>(
        existingRows.map((r) => [r._id.toString(), r])
      );

      // Same coercion validateFinalCheckNumber uses (finalCheckNumber, else
      // numeric original). Returns undefined for blank/missing values so
      // empty originalCheckNumber strings are NOT treated as the number 0.
      const toCheckNumberKey = (
        row: Pick<
          ICheckImportRow,
          'finalCheckNumber' | 'originalCheckNumber'
        >
      ): string | undefined => {
        if (
          row.finalCheckNumber !== undefined &&
          row.finalCheckNumber !== null
        ) {
          return String(row.finalCheckNumber);
        }
        const orig = row.originalCheckNumber;
        if (orig === undefined || orig === null || orig === '') {
          return undefined;
        }
        const num = +orig;
        return Number.isFinite(num) ? String(num) : undefined;
      };

      // validateFinalCheckNumber short-circuits as valid when the bank uses
      // auto-generated check numbers, so skip in-import duplicate detection
      // in that case to match existing behavior.
      const bank = await this.checkImportCache.getBank({
        bankId,
        ownerId: ownerId.toString(),
        ownerType,
      });
      const isAutoCheckNumber =
        bank?.bankPreferences?.checkNoGeneration === 'auto';

      // Compute in-import duplicates once (replacing the per-row
      // countDocuments call inside validateFinalCheckNumber). Tally over
      // all rows in the import, applying pending edits from this save so
      // the duplicate set reflects the post-save state.
      const duplicateCheckNumbersInImport = new Set<string>();
      if (!isAutoCheckNumber) {
        const allImportRows: Array<
          Pick<
            ICheckImportRow,
            '_id' | 'finalCheckNumber' | 'originalCheckNumber'
          >
        > = await checkImportRowCollection
          .find({ importId, ownerId, ownerType })
          .select('finalCheckNumber originalCheckNumber')
          .lean();

        const editedById = new Map<string, ICheckImportRow>(
          rows.map((r) => [r._id!.toString(), r])
        );

        const counts = new Map<string, number>();
        for (const r of allImportRows) {
          const edit = editedById.get(r._id!.toString());
          const effective: Pick<
            ICheckImportRow,
            'finalCheckNumber' | 'originalCheckNumber'
          > = edit
            ? {
                finalCheckNumber:
                  edit.finalCheckNumber !== undefined
                    ? edit.finalCheckNumber
                    : r.finalCheckNumber,
                originalCheckNumber:
                  edit.originalCheckNumber !== undefined
                    ? edit.originalCheckNumber
                    : r.originalCheckNumber,
              }
            : r;
          const key = toCheckNumberKey(effective);
          if (key !== undefined) {
            counts.set(key, (counts.get(key) || 0) + 1);
          }
        }
        for (const [key, count] of counts) {
          if (count > 1) duplicateCheckNumbersInImport.add(key);
        }
      }

      // Validate edited rows in parallel with the warmed cache and apply
      // the in-import duplicate flag locally so we don't repeat the
      // per-row countDocuments query.
      const validatedDocs: Array<ICheckImportRow | null> = await Promise.all(
        rows.map(async (inputRow) => {
          const dbRow = existingMap.get(inputRow._id!.toString());
          if (!dbRow) return null;

          Object.assign(dbRow, inputRow);

          const validated: ICheckImportRow = await this.validateRow({
            row: dbRow,
            bankId,
            checkForDuplicateCheckNumber: false,
          });

          if (
            validated.state !== 'skipped' &&
            validated.state !== 'submitted' &&
            duplicateCheckNumbersInImport.size > 0
          ) {
            const key = toCheckNumberKey(validated);
            if (key !== undefined && duplicateCheckNumbersInImport.has(key)) {
              const errors: Record<string, string[]> =
                validated.validationErrors ?? {};
              const checkNumberErrors = errors.checkNumber ?? [];
              const dupMsg = 'Duplicate Check number ';
              if (!checkNumberErrors.includes(dupMsg)) {
                checkNumberErrors.push(dupMsg);
              }
              errors.checkNumber = checkNumberErrors;
              validated.validationErrors = errors;
              validated.state = 'invalid';
            }
          }

          return validated;
        })
      );

      const bulkOps = validatedDocs
        .filter((v): v is ICheckImportRow => v !== null)
        .map((validated) => {
          // Remove __v if present (to avoid versioning errors)
          const { __v, ...updatePayload } = validated;
          return {
            updateOne: {
              filter: {
                _id: validated._id,
                ownerId: validated.ownerId,
                ownerType: validated.ownerType,
              },
              update: { $set: updatePayload },
            },
          };
        });

      // 4. Perform bulk update
      if (bulkOps.length > 0) {
        await checkImportRowCollection.bulkWrite(bulkOps, { ordered: false });
      }

      // 5. Update import document's row counts
      const rowCounts = await this.getCounts({ ownerId, ownerType, importId });
      await checkImportCollection.updateOne(
        { _id: importId, ownerId, ownerType },
        { $set: { rowCounts } }
      );

      // 6. Fetch updated rows to return
      return { message: 'rows saved' };
    } catch (error) {
      console.error('Error in saveRows:', error);
      throw error;
    }
  }
  async submitRows({ importId, rowIds, ownerId, ownerType }: SubmitRowRequest) {
    try {
      // 1. Get current import and validate bank account
      const currentImport = await this.getCurrentImport({
        ownerId,
        ownerType,
        importId,
      });
      if (!currentImport.bankAccountId) throw new Error('Bank Id not found');

      const bankId = currentImport.bankAccountId.toString();
      const bank = await this.getBankDetails({ ownerId, ownerType, bankId });
      const checkNumberGenerateMode = bank.bankPreferences.checkNoGeneration;

      // 2. Get starting check number if in auto mode
      let startingCheckNumber: number | null = null;
      if (checkNumberGenerateMode === 'auto') {
        startingCheckNumber = await getNextAvailableCheckNumber({
          ownerId,
          ownerType,
          bankId,
        });
        if (!startingCheckNumber) {
          throw new Error(
            'Failed to generate the next available check number.'
          );
        }
      }

      // 3. Fetch the rows to process
      const rows = await checkImportRowCollection.find({
        _id: { $in: rowIds },
        ownerId,
        ownerType,
        importId,
      });

      // 4. Separate valid and invalid rows
      const validRows = rows.filter((row) => row?.state === 'valid');
      const invalidRows = rows.filter((row) => row?.state !== 'valid');

      // 5. Prepare check documents and validate rows
      type SuccessfulCheck = {
        row: ICheckImportRow;
        checkDoc: any;
      };

      const successfulChecks: SuccessfulCheck[] = [];
      const failedCheckResults: {
        updatedRow: ICheckImportRow;
        checkResult: { status: 'failure'; errors: string[] };
      }[] = [];

      validRows.forEach((row, index) => {
        const checkNumber =
          checkNumberGenerateMode === 'auto'
            ? startingCheckNumber! + index
            : row.finalCheckNumber;

        // Validate required fields
        const errors: string[] = [];
        if (!checkNumber) errors.push('Check number is required.');
        if (!row.finalPayeeId) errors.push('Missing final payee.');
        if (!row.finalAmount) errors.push('Missing final amount.');

        if (errors.length > 0) {
          failedCheckResults.push({
            updatedRow: row,
            checkResult: { status: 'failure', errors },
          });
          return;
        }

        // Create check document
        const checkDoc = {
          amount: row.finalAmount!,
          payeeId: row.finalPayeeId!,
          bankId,
          ownerId,
          ownerType,
          invoiceId: row.finalInvoiceId!,
          importId,
          checkNumber,
          issuedDate: new Date(),
          status: 'DRAFT',
        };

        successfulChecks.push({ row, checkDoc });
      });

      // 6. Create checks in database
      const insertedChecks = await checksCollection.insertMany(
        successfulChecks.map((item) => item.checkDoc),
        { ordered: false }
      );

      // 7. Update successful checks with their generated IDs
      insertedChecks.forEach((insertedDoc, i) => {
        successfulChecks[i].checkDoc._id = insertedDoc._id;
      });

      // 8. Update rows to 'submitted' status for all successfully created checks
      if (successfulChecks.length > 0) {
        const bulkUpdateOps = successfulChecks.map(({ row, checkDoc }) => ({
          updateOne: {
            filter: { _id: row._id },
            update: {
              $set: {
                state: 'submitted',
                checkId: checkDoc._id,
                submittedAt: new Date(),
                submittedBy: ownerId as string,
                finalCheckNumber: checkDoc.checkNumber,
              },
            },
          },
        }));

        await checkImportRowCollection.bulkWrite(bulkUpdateOps);
      }

      // 9. Prepare results
      const successfulResults = successfulChecks.map(({ row, checkDoc }) => {
        const updatedRow = {
          ...row,
          state: 'submitted',
          checkId: checkDoc._id!,
          submittedAt: new Date(),
          submittedBy: ownerId as string,
          finalCheckNumber: checkDoc.checkNumber,
        };

        return {
          updatedRow,
          checkResult: {
            status: 'success' as const,
            checkNumber: checkDoc.checkNumber,
            checkStatus: checkDoc.status,
            checkId: checkDoc._id!.toString(),
          },
        };
      });

      const invalidResults = invalidRows.map((row) => ({
        updatedRow: row,
        checkResult: {
          status: 'failure' as const,
          errors: Object.values(row.validationErrors ?? {}),
        },
      }));

      const allResults = [
        ...successfulResults,
        ...failedCheckResults,
        ...invalidResults,
      ];

      // 10. Update import counts
      const rowCounts = await this.getCounts({ importId, ownerId, ownerType });
      await checkImportCollection.findOneAndUpdate(
        { _id: importId, ownerId, ownerType },
        { rowCounts }
      );

      // 11. Return results with check details
      const rowsWithCheckDetails = allResults.map(
        ({ updatedRow, checkResult }) => ({
          ...updatedRow,
          checkDetails: {
            _id:
              checkResult.status === 'success'
                ? checkResult.checkId
                : undefined,
            status:
              checkResult.status === 'success'
                ? checkResult.checkStatus
                : undefined,
          },
        })
      );

      return {
        rows: rowsWithCheckDetails,
        result: allResults.map((item) => item.checkResult),
      };
    } catch (error) {
      console.error('Error in submitRows:', error);
      throw error;
    }
  }

  async updateImportBankId({
    ownerId,
    ownerType,
    bankAccountId,
    importId,
  }: BaseInfo & { bankAccountId: string; importId: string }) {
    try {
      // Step 1: Update the bank account ID for the import
      await checkImportCollection.findOneAndUpdate(
        { ownerId, ownerType, _id: importId },
        { bankAccountId }
      );

      // Step 2: Get all rows for the import
      const rows = await this.getRowsByImport({ importId, ownerId, ownerType });

      // Step 3: Ensure no submitted rows exist
      const isSubmitted = rows?.some((row) => row.state === 'submitted');
      if (isSubmitted) {
        throw new Error(
          'Cannot change bank while some of the rows are submitted'
        );
      }

      // Same coercion validateFinalCheckNumber uses (finalCheckNumber, else
      // numeric original). Returns undefined for blank/missing values so
      // empty originalCheckNumber strings are NOT treated as the number 0.
      const toCheckNumberKey = (
        row: ICheckImportRow
      ): string | undefined => {
        if (
          row.finalCheckNumber !== undefined &&
          row.finalCheckNumber !== null
        ) {
          return String(row.finalCheckNumber);
        }
        const orig = row.originalCheckNumber;
        if (orig === undefined || orig === null || orig === '') {
          return undefined;
        }
        const num = +orig;
        return Number.isFinite(num) ? String(num) : undefined;
      };

      // Batch preload bank, check-number existence, and payee caches so
      // validateRow doesn't hit the DB once per row. Use the same
      // normalization as validation so cache keys match.
      const preloadCheckNumbers: Array<string | number> = [];
      for (const r of rows) {
        const key = toCheckNumberKey(r);
        if (key !== undefined) {
          const n = Number(key);
          preloadCheckNumbers.push(Number.isFinite(n) ? n : key);
        }
      }
      await this.preLoadCache({
        bankId: bankAccountId,
        ownerId,
        ownerType,
        checkNumbers: preloadCheckNumbers,
        payees: rows.map((r) => ({
          name: r.originalPayeeName,
          payeeId: r.finalPayeeId ? r.finalPayeeId.toString() : undefined,
        })),
      });

      // validateFinalCheckNumber short-circuits as valid when the bank uses
      // auto-generated check numbers, so skip in-import duplicate detection
      // in that case to match existing behavior.
      const newBank = await this.checkImportCache.getBank({
        bankId: bankAccountId,
        ownerId: ownerId.toString(),
        ownerType,
      });
      const isAutoCheckNumber =
        newBank?.bankPreferences?.checkNoGeneration === 'auto';

      // Replace the prior per-row countDocuments duplicate check with a
      // single in-memory tally over all rows (the prior query did not
      // filter by state).
      const duplicateCheckNumbersInImport = new Set<string>();
      if (!isAutoCheckNumber) {
        const counts = new Map<string, number>();
        for (const row of rows) {
          const key = toCheckNumberKey(row);
          if (key !== undefined) {
            counts.set(key, (counts.get(key) || 0) + 1);
          }
        }
        for (const [key, count] of counts) {
          if (count > 1) duplicateCheckNumbersInImport.add(key);
        }
      }

      // Validate in parallel with the cache warmed and apply the duplicate
      // flag locally. Skipped/submitted rows are left untouched to match
      // validateRow's early return for those states.
      const validatedRows: any[] = await Promise.all(
        rows.map(async (row) => {
          const validated = await this.validateRow({
            row,
            bankId: bankAccountId,
            checkForDuplicateCheckNumber: false,
          });

          if (
            validated.state === 'skipped' ||
            validated.state === 'submitted'
          ) {
            return validated;
          }

          if (duplicateCheckNumbersInImport.size === 0) return validated;

          const key = toCheckNumberKey(validated);
          if (key !== undefined && duplicateCheckNumbersInImport.has(key)) {
            const errors = validated.validationErrors ?? {};
            const checkNumberErrors = errors.checkNumber ?? [];
            const dupMsg = 'Duplicate Check number ';
            if (!checkNumberErrors.includes(dupMsg)) {
              checkNumberErrors.push(dupMsg);
            }
            errors.checkNumber = checkNumberErrors;
            validated.validationErrors = errors;
            validated.state = 'invalid';
          }

          return validated;
        })
      );

      // Step 5: Save them all using bulkWrite
      const bulkOps = validatedRows.map((r) => ({
        updateOne: {
          filter: { _id: r._id },
          update: { $set: r.toObject({ versionKey: false }) },
        },
      }));

      if (bulkOps.length > 0) {
        await checkImportRowCollection.bulkWrite(bulkOps);
      }

      // Step 6: Return validated rows
      return validatedRows;
    } catch (error) {
      console.error('Error in updateImportBankId:', error);
      throw error;
    }
  }

  async getImportById(importId: string) {
    try {
      const importData = await checkImportCollection.findById(importId);

      if (!importData) throw new Error(`Import :${importId} is not found`);

      return importData;
    } catch (error) {
      throw error;
    }
  }

  private async getCurrentImport({
    importId,
    ownerId,
    ownerType,
  }: GetImportRequest) {
    try {
      const currentImport = await checkImportCollection.findOne({
        _id: importId,
        ownerId,
        ownerType,
      });

      if (!currentImport)
        throw new Error('No Import with given information is found');

      return currentImport;
    } catch (error) {
      throw error;
    }
  }

  async getRowsByImport({
    ownerId,
    importId,
    ownerType,
    shouldPopulate = false,
  }: GetImportRowsRequest): Promise<ICheckImportRow[]> {
    try {
      if (shouldPopulate) {
        const rows = await checkImportRowCollection
          .find({ ownerId, ownerType, importId })
          .populate('checkId', 'status')
          .lean();

        if (!rows?.length) return [];

        return rows.map(({ checkId, ...rest }) => ({
          ...rest,
          checkId: checkId?._id,
          checkDetails: checkId,
        })) as any;
      } else {
        const rows = await checkImportRowCollection.find({
          ownerId,
          ownerType,
          importId,
        });

        if (!rows?.length) return [];

        return rows;
      }
    } catch (error) {
      throw error;
    }
  }

  downloadTemplate() {
    try {
      const filePath = path.join(
        __dirname,
        '../templates/checkImport/check_import_template.csv'
      );
      return filePath;
    } catch (error) {
      throw error;
    }
  }

  private async getBankDetails({ ownerId, ownerType, bankId }: GetBankRequest) {
    try {
      const bank = await banksCollection.findOne({
        ownerId,
        ownerType,
        _id: bankId,
      });

      if (!bank) throw new Error(`Bank : ${bankId} is not found`);
      return bank;
    } catch (error) {
      throw error;
    }
  }

  private async parseFile(
    buffer: Buffer,
    mimeType: string
  ): Promise<ParsedRow[]> {
    if (mimeType === 'text/csv') {
      return this.parseCsv(buffer);
    } else {
      return await this.parseExcel(buffer);
    }
  }

  private parseCsv(buffer: Buffer): Promise<ParsedRow[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(buffer.toString(), {
        header: true,
        skipEmptyLines: true,

        transformHeader: (header: string) => {
          return this.normalizeHeader(header);
        },
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error('CSV Parsing Errors:', results.errors);
            // Provide a more user-friendly error message if needed
            return reject(
              new Error(
                'Error parsing CSV file. Please check the file format or headers.'
              )
            );
          }

          const normalizedData = (results.data as Record<string, any>[]).map(
            (row) => {
              // Access data using the fully normalized column names
              return {
                checkNumber: this.getColumnValue(row, 'checkNumber'),
                amount: this.getColumnValue(row, 'amount'),
                payeeName: this.getColumnValue(row, 'payeeName'),
                note: this.getColumnValue(row, 'note'),
                invoiceId: this.getColumnValue(row, 'invoiceId'),
                issueDate: this.getColumnValue(row, 'issueDate'),
              };
            }
          );

          resolve(normalizedData as ParsedRow[]);
        },
        error: (error) => {
          console.error('PapaParse Error:', error);
          reject(error);
        },
      });
    });
  }

  private async parseExcel(buffer: Buffer): Promise<ParsedRow[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
    const worksheet = workbook.worksheets[0];

    if (!worksheet) return [];

    // Extract headers from the first row
    const headers: string[] = [];
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      headers[colNumber - 1] = String(cell.value ?? '');
    });

    if (headers.length === 0) return [];

    // Build array of row objects (same shape as XLSX.utils.sheet_to_json)
    const data: Record<string, string>[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header row
      const rowData: Record<string, string> = {};
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const header = headers[colNumber - 1];
        if (!header) return;
        // Format date cells as MM/DD/YY
        if (cell.type === ExcelJS.ValueType.Date) {
          const date = cell.value as Date;
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');
          const yy = String(date.getFullYear()).slice(-2);
          rowData[header] = `${mm}/${dd}/${yy}`;
        } else {
          rowData[header] = cell.text ?? '';
        }
      });
      data.push(rowData);
    });

    if (data.length === 0) return [];

    // Create column mapping from the first row's keys
    const columnMapping = this.createColumnMapping(headers.filter((h) => h));

    return data.map((row) => ({
      checkNumber: this.getValueFromMapping(row, columnMapping, 'checkNumber'),
      amount: this.getValueFromMapping(row, columnMapping, 'amount'),
      payeeName: this.getValueFromMapping(row, columnMapping, 'payeeName'),
      note: this.getValueFromMapping(row, columnMapping, 'note'),
      invoiceId: this.getValueFromMapping(row, columnMapping, 'invoiceId'),
      issueDate: this.getValueFromMapping(row, columnMapping, 'issueDate'),
    }));
  }

  private createColumnMapping(headers: string[]): Record<string, string> {
    const mapping: Record<string, string> = {};
    const targetColumns = [
      'checkNumber',
      'amount',
      'payeeName',
      'note',
      'invoiceId',
    ];

    headers.forEach((header) => {
      const normalized = this.normalizeHeader(header);

      // Map common variations to target column names
      const columnMappings: Record<string, string> = {
        checknumber: 'checkNumber', // handles: checkNumber, check_number, check-number, CHECK NUMBER, etc.
        checknumb: 'checkNumber',
        checkno: 'checkNumber',
        chknumber: 'checkNumber',
        chkno: 'checkNumber',

        amount: 'amount',
        amt: 'amount',

        payeename: 'payeeName',
        payee: 'payeeName',
        payto: 'payeeName',
        recipient: 'payeeName',

        note: 'note',
        notes: 'note',
        memo: 'note',
        description: 'note',

        invoiceid: 'invoiceId',
        invoice: 'invoiceId',
        invid: 'invoiceId',
        invoiceno: 'invoiceId',
        invoicenumber: 'invoiceId',

        issuedate: 'issueDate',
        issueddate: 'issueDate',
        date: 'issueDate',
      };

      const targetColumn = columnMappings[normalized];

      if (targetColumn) {
        mapping[header] = targetColumn;
      }
    });

    return mapping;
  }

  private normalizeHeader(header: string): string {
    return header.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  private getValueFromMapping(
    row: Record<string, any>,
    columnMapping: Record<string, string>,
    targetColumn: string
  ): string | undefined {
    // Find the original header that maps to our target column
    const originalHeader = Object.keys(columnMapping).find(
      (header) => columnMapping[header] === targetColumn
    );

    if (originalHeader && row[originalHeader] !== undefined) {
      const value = row[originalHeader];
      return value ? String(value).trim() : undefined;
    }

    return undefined;
  }

  private getColumnValue(
    row: Record<string, any>,
    targetColumnName: string
  ): string | undefined {
    // First try exact match (for backwards compatibility)
    if (row[targetColumnName] !== undefined) {
      const value = row[targetColumnName];
      return value ? String(value).trim() : undefined;
    }

    // If no exact match, try flexible matching
    const normalizedTarget = this.normalizeHeader(targetColumnName);

    // Find the key that matches our normalized target
    const matchingKey = Object.keys(row).find(
      (key) => this.normalizeHeader(key) === normalizedTarget
    );

    if (matchingKey) {
      const value = row[matchingKey];
      return value ? String(value).trim() : undefined;
    }

    return undefined;
  }

  private async processRows({
    rows,
    importId,
    ownerType,
    ownerId,
    userId,
  }: {
    rows: ParsedRow[];
    importId: string;
    ownerType: BaseInfo['ownerType'];
    ownerId: string;
    userId: string;
  }) {
    const rowDocuments = [];
    let rowNumber = 1;

    const checkNumberCounts = new Map<string, number>();
    for (const row of rows) {
      if (row.checkNumber) {
        const checkNumStr = String(row.checkNumber);
        checkNumberCounts.set(
          checkNumStr,
          (checkNumberCounts.get(checkNumStr) || 0) + 1
        );
      }
    }

    const duplicateCheckNumbers = new Set<string>();
    for (const [checkNum, count] of checkNumberCounts.entries()) {
      if (count > 1) {
        duplicateCheckNumbers.add(checkNum);
      }
    }

    // Batch-resolve payee suggestions for all distinct names in one DB
    // round-trip via loadPayees, then read the cache synchronously below.
    const uniquePayeeNames = Array.from(
      new Set(
        rows
          .map((r) => r?.payeeName)
          .filter((n): n is string => typeof n === 'string' && n.length > 0)
      )
    );
    if (uniquePayeeNames.length > 0) {
      await this.checkImportCache.loadPayees({
        ownerId,
        ownerType,
        payees: uniquePayeeNames.map((name) => ({ name, payeeId: undefined })),
      });
    }
    const payeeIdByName = new Map<string, string | undefined>();
    for (const name of uniquePayeeNames) {
      payeeIdByName.set(
        name,
        await this.checkImportCache.getPayeeId({ ownerId, ownerType, name })
      );
    }

    for (const row of rows) {
      const validationErrors = new Map<string, string[]>();
      let state: 'valid' | 'invalid' = 'valid';

      let parsedAmount: number | undefined;
      if (!row.amount) {
        validationErrors.set('amount', ['Amount is required']);
        state = 'invalid';
      } else {
        const cleanedAmountString = String(row.amount).replace(/[^0-9.]/g, '');
        parsedAmount = parseFloat(cleanedAmountString);

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          validationErrors.set('amount', ['Amount must be a positive number']);
          state = 'invalid';
        }
      }

      if (
        row.checkNumber &&
        duplicateCheckNumbers.has(String(row.checkNumber))
      ) {
        const errors = validationErrors.get('checkNumber') || [];
        errors.push('Duplicate check number within the imported file');
        validationErrors.set('checkNumber', errors);
        state = 'invalid';
      }

      let finalIssueDate: Date;

      const parsedDate = row.issueDate ? new Date(row.issueDate) : new Date();

      if (isNaN(parsedDate.getTime())) {
      } else {
        finalIssueDate = parsedDate;
      }

      let suggestedPayeeId: string | undefined = row?.payeeName
        ? payeeIdByName.get(row.payeeName)
        : undefined;

      rowDocuments.push({
        importId,
        ownerType,
        ownerId,
        rowNumber: rowNumber++,
        originalCheckNumber: row.checkNumber || '',
        originalAmount: row.amount || '',
        originalPayeeName: row.payeeName || '',
        originalNote: row.note || '',
        originalInvoiceId: row.invoiceId || '',
        originalIssueDate: row.issueDate || '',
        finalCheckNumber: row?.checkNumber || undefined,
        finalAmount: !validationErrors.get('amount') ? parsedAmount : undefined,
        finalPayeeId: suggestedPayeeId,
        suggestedPayeeId,
        finalNote: row.note || '',
        finalInvoiceId: row.invoiceId || '',
        finalIssueDate: finalIssueDate,
        validationErrors,
        state,
        checkId: undefined,
        submittedAt: undefined,
        submittedBy: undefined,
      });
    }

    return rowDocuments as ICheckImportRow[];
  }

  private validateFinalAmount(amount: number) {
    const validResult: ValidationResult = { valid: true, errors: [] };

    const validationResult: Partial<
      Record<ValidationFields, ValidationResult>
    > = {};

    if (amount <= 0) {
      return (validationResult['amount'] = {
        valid: false,
        errors: ['amount should be positive and greater than 0'],
      });
    } else {
      return (validationResult['amount'] = validResult);
    }
  }

  private async validateFinalCheckNumber({
    bankId,
    checkNumber,
    ownerId,
    ownerType,
    checkForDuplicateCheckNumber,
    importId,
  }: ValidateCheckNumberRequest) {
    try {
      const validResult: ValidationResult = { valid: true, errors: [] };

      const validationResult: Partial<
        Record<ValidationFields, ValidationResult>
      > = {};

      const associatedBank = await this.checkImportCache.getBank({
        bankId,
        ownerId: ownerId.toString(),
        ownerType,
      });

      const checkNumberGenerationMode =
        associatedBank.bankPreferences.checkNoGeneration;

      if (checkNumberGenerationMode === 'auto') {
        return (validationResult['checkNumber'] = validResult);
      } else {
        // Use cache for check number existence
        const checkExists = await this.checkImportCache.checkNumberExists({
          ownerId: ownerId.toString(),
          ownerType,
          bankId,
          checkNumber,
        });

        if (checkExists) {
          validationResult['checkNumber'] = {
            valid: false,
            errors: [
              `Check against check number :${checkNumber} already exists`,
            ],
          };
        } else {
          validationResult['checkNumber'] = validResult;
        }

        if (checkForDuplicateCheckNumber) {
          const row = await checkImportRowCollection.countDocuments({
            $or: [
              { finalCheckNumber: checkNumber },
              {
                finalCheckNumber: { $exists: false },
                originalCheckNumber: checkNumber,
              },
            ],
            ownerId,
            ownerType,
            importId,
          });

          if (row > 1) {
            validationResult['checkNumber'] = {
              valid: false,
              errors: [`Duplicate Check number `],
            };
          }
        }
      }

      return validationResult['checkNumber'];
    } catch (error) {
      throw error;
    }
  }

  private async validatePayeeId({
    ownerId,
    ownerType,
    payeeId,
    payeeName,
  }: ValidatePayeeRequest) {
    try {
      const validResult: ValidationResult = { valid: true, errors: [] };

      const validationResult: Partial<
        Record<ValidationFields, ValidationResult>
      > = {};

      const payee = await this.checkImportCache.getPayeeId({
        ownerId: ownerId.toString(),
        ownerType,
        name: payeeName,
        payeeId,
      });

      if (payee) {
        validationResult['payeeId'] = validResult;
      } else {
        validationResult['payeeId'] = {
          valid: false,
          errors: [
            payeeId
              ? `Payee with id ${payeeId} does not exist`
              : `Payee with name "${payeeName}" does not exist`,
          ],
        };
      }

      return validationResult['payeeId'];
    } catch (error) {
      throw error;
    }
  }

  private async getCounts({
    ownerId,
    ownerType,
    importId,
  }: BaseInfo & { importId: String }) {
    type RowState = 'valid' | 'invalid' | 'submitted' | 'skipped';
    const ROW_STATES: ReadonlySet<RowState> = new Set([
      'valid',
      'invalid',
      'submitted',
      'skipped',
    ]);

    const aggregated = (await checkImportRowCollection.aggregate([
      { $match: { ownerId, ownerType, importId } },
      { $group: { _id: '$state', count: { $sum: 1 } } },
    ])) as Array<{ _id: string; count: number | string }>;

    const counts: Record<RowState, number> & { total: number } = {
      valid: 0,
      invalid: 0,
      submitted: 0,
      skipped: 0,
      total: 0,
    };

    for (const { _id: state, count } of aggregated) {
      const n = Number(count);
      if (ROW_STATES.has(state as RowState)) {
        counts[state as RowState] = n;
      }
      counts.total += n;
    }

    return counts;
  }

  private preLoadCache = async ({
    ownerId,
    ownerType,
    checkNumbers,
    payees,
    bankId,
  }: PreLoadCacheRequest) => {
    try {
      await this.checkImportCache.loadBanks({
        bankIds: [bankId],
        ownerId: ownerId.toString(),
        ownerType,
      });

      await this.checkImportCache.loadCheckNumbers({
        bankId,
        checkNumbers,
        ownerId: ownerId.toString(),
        ownerType,
      });

      await this.checkImportCache.loadPayees({
        ownerId: ownerId.toString(),
        ownerType,
        payees,
      });
    } catch (error) {
      throw error;
    }
  };
}

export const CheckImport = new CheckImportService();
