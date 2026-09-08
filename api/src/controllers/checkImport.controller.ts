import { Router, Response, Request, NextFunction } from 'express';
import { SynccosRequest } from '../types/express';
import { CheckImport as CheckImportService } from '../services/checksImport.service';
import { ListImportsRequest } from '../types/checkImports';
import { ICheckImportRow } from '../services/checkImport.schema';
import { OwnerType } from '../enums/user.enum';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /checks-import/getImports/{ownerType}:
 *   get:
 *     summary: Retrieve a list of import records
 *     description: Fetches all import records for a user or organization, optionally filtered by status.
 *     tags:
 *       - Check Imports
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Type of the import owner (user or organization).
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter imports by status.
 *     responses:
 *       200:
 *         description: Successfully retrieved list of imports.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 importsList:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Individual import record.
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message describing the server issue.
 */

router.get(
  '/getImports/:ownerType',
  async (req: SynccosRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      const organizationId = req.organizationId;
      const { ownerType } = req.params;
      const { status } = req.query;

      const ownerId = ownerType === 'user' ? userId : organizationId;

      const query: ListImportsRequest = { ownerId, ownerType };

      if (status) {
        query['status'] = status as any;
      }

      const importsList = await CheckImportService.listImports(query);
      res.send({ importsList });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /checks-import/updateImportBank/{ownerType}:
 *   post:
 *     summary: Update the bank account ID for an import
 *     description: Updates the bankAccountId of a specific import record for a user or organization.
 *     tags:
 *       - Check Imports
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Type of the import owner (user or organization).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               importId:
 *                 type: string
 *                 description: ID of the import to update.
 *               bankAccountId:
 *                 type: string
 *                 description: New bank account ID to associate with the import.
 *             required:
 *               - importId
 *               - bankAccountId
 *     responses:
 *       200:
 *         description: Successfully updated import's bank account.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rows:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Updated import rows
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message describing the server issue.
 */

router.post(
  '/updateImportBank/:ownerType',
  async (req: SynccosRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      const organizationId = req.organizationId;
      const { ownerType } = req.params;

      const { importId, bankAccountId } = req.body;

      const ownerId = ownerType === 'user' ? userId : organizationId;

      const updatedImportRows = await CheckImportService.updateImportBankId({
        bankAccountId,
        importId,
        ownerId,
        ownerType,
      });

      res.send({ rows: updatedImportRows });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /checks-import/getImportRows/{ownerType}:
 *   get:
 *     summary: Retrieve rows of a specific import
 *     description: Fetches all rows associated with a given import ID for a user or organization.
 *     tags:
 *       - Check Imports
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Type of the import owner (user or organization).
 *       - in: query
 *         name: importId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the import whose rows are to be fetched.
 *     responses:
 *       200:
 *         description: Successfully retrieved import rows.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 importRows:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Individual import row data
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message describing the server issue.
 */

router.get(
  '/getImportRows/:ownerType',
  async (req: SynccosRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      const organizationId = req.organizationId;
      const { ownerType } = req.params;

      const { importId } = req.query;

      const ownerId = ownerType === 'user' ? userId : organizationId;

      const importRows = await CheckImportService.getRowsByImport({
        ownerId,
        ownerType,
        importId,
        shouldPopulate: true,
      });

      res.send({ importRows });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /checks-import/cancelImport/{ownerType}:
 *   post:
 *     summary: Cancel an import
 *     description: Cancels a specific import for a user or organization based on the provided import ID.
 *     tags:
 *       - Check Imports
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Type of the import owner (user or organization).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               importId:
 *                 type: string
 *                 description: ID of the import to cancel.
 *             required:
 *               - importId
 *     responses:
 *       200:
 *         description: Successfully canceled the import.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 canceledImport:
 *                   type: object
 *                   description: The canceled import record.
 *                 message:
 *                   type: string
 *                   example: Import canceled
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message describing the server issue.
 */

router.post(
  '/cancelImport/:ownerType',
  async (req: SynccosRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      const organizationId = req.organizationId;
      const { ownerType } = req.params;

      const ownerId = ownerType === 'user' ? userId : organizationId;

      const { importId } = req.body;

      const canceledImport = await CheckImportService.cancelImport({
        importId,
        ownerId,
        ownerType,
      });
      res.send({
        canceledImport: canceledImport,
        message: 'Import canceled',
      });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /checks-import/downloadImport/{ownerType}:
 *   post:
 *     summary: Generate a download URL for an import file
 *     description: Returns a signed URL to download the file associated with a specific import ID for a user or organization.
 *     tags:
 *       - Check Imports
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Type of the import owner (user or organization).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               importId:
 *                 type: string
 *                 description: ID of the import to download.
 *             required:
 *               - importId
 *     responses:
 *       200:
 *         description: Successfully generated the download URL.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   format: uri
 *                   description: Signed URL to download the import file.
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message describing the server issue.
 */

router.post(
  '/downloadImport/:ownerType',
  async (req: SynccosRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      const organizationId = req.organizationId;
      const { ownerType } = req.params;
      const ownerId = ownerType === 'user' ? userId : organizationId;

      const { importId } = req.body;

      const url = await CheckImportService.downloadImportFile({
        ownerId,
        ownerType,
        importId,
      });

      res.send({ url });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /checks-import/finalizeImport/{ownerType}:
 *   post:
 *     summary: Finalize an import
 *     description: Marks a specific import as finalized for a user or organization based on the provided import ID.
 *     tags:
 *       - Check Imports
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Type of the import owner (user or organization).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               importId:
 *                 type: string
 *                 description: ID of the import to finalize.
 *             required:
 *               - importId
 *     responses:
 *       200:
 *         description: Successfully finalized the import.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 finalizedImport:
 *                   type: object
 *                   description: The finalized import record.
 *                 message:
 *                   type: string
 *                   example: Import is finalized
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message describing the server issue.
 */

router.post(
  '/finalizeImport/:ownerType',
  async (req: SynccosRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      const organizationId = req.organizationId;
      const { ownerType } = req.params;
      const ownerId = ownerType === 'user' ? userId : organizationId;

      const { importId } = req.body;

      const finalizedImport = await CheckImportService.finalizeImport({
        importId,
        ownerId,
        ownerType,
      });

      res.send({ finalizedImport, message: 'Import is finalized' });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /checks-import/export/{ownerType}:
 *   get:
 *     summary: Export import rows as CSV
 *     description: Exports the rows of a specific import for a user or organization. Supports returning a downloadable file or raw CSV data.
 *     tags:
 *       - Check Imports
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Type of the import owner (user or organization).
 *       - in: query
 *         name: importId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the import to export.
 *       - in: query
 *         name: returnAs
 *         required: false
 *         schema:
 *           type: string
 *           enum: [file]
 *         description: If set to 'file', the response will trigger a file download. Otherwise, raw CSV data is returned.
 *     responses:
 *       200:
 *         description: Successfully exported import data.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     csvData:
 *                       type: string
 *                       description: Raw CSV data as string.
 *                     fileName:
 *                       type: string
 *                       description: Suggested filename for the CSV.
 *                 - type: string
 *                   format: binary
 *                   description: Redirects to a downloadable CSV file.
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message describing the server issue.
 */

router.get('/export/:ownerType', async (req: SynccosRequest, res: Response) => {
  try {
    const userId = req.userId;
    const organizationId = req.organizationId;
    const { ownerType } = req.params;
    const ownerId = ownerType === 'user' ? userId : organizationId;

    const { importId, returnAs } = req.query;

    if (returnAs === 'file') {
      const fileUrl = await CheckImportService.downloadImportFile({
        importId: importId as string,
        ownerId: ownerId as string,
        ownerType,
      });
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="export_${importId}.csv"`
      );
      res.setHeader('Content-Type', 'text/csv');
      res.redirect(fileUrl);
      return;
    } else {
      const { csvData, fileName } =
        await CheckImportService.exportRowsByImportId({
          importId,
          ownerId,
          ownerType,
        });

      res.setHeader('Content-Type', 'text/csv');
      res.send({ csvData, fileName });
      return;
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * @swagger
 * /checks-import/validateRow:
 *   post:
 *     summary: Validate a single import row
 *     description: Validates the provided import row data against business rules. Does not persist data or trigger DB calls.
 *     tags:
 *       - Check Imports
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckImportRow'
 *     responses:
 *       200:
 *         description: Validation results for the row.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isValid:
 *                   type: boolean
 *                   description: Indicates if the row passed validation.
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of validation error messages (if any).
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message describing the server issue.
 */

router.post(
  '/validateRow',
  async (req: SynccosRequest, res: Response, next: NextFunction) => {
    try {
      const row = req.body as ICheckImportRow;

      const currentImport = await CheckImportService.getImportById(
        row?.importId
      );

      const validationResults = await CheckImportService.validateRow({
        row: row as ICheckImportRow,
        checkForDuplicateCheckNumber: false,
        bankId: currentImport.bankAccountId.toString(),
      });

      res.send(validationResults);
      return;
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /checks-import/saveRows/{ownerType}:
 *   post:
 *     summary: Save multiple import rows
 *     description: Saves multiple rows for a given import ID, associated with a user or organization.
 *     tags:
 *       - Check Imports
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Type of the import owner (user or organization).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               importId:
 *                 type: string
 *                 description: ID of the import to which the rows belong.
 *               rows:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/CheckImportRow'
 *                 description: Array of rows to be saved.
 *             required:
 *               - importId
 *               - rows
 *     responses:
 *       200:
 *         description: Successfully saved the import rows.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 description: Saved row data.
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message describing the server issue.
 */

router.post(
  '/saveRows/:ownerType',
  async (req: SynccosRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      const organizationId = req.organizationId;
      const { ownerType } = req.params;
      const { importId, rows } = req.body;
      const ownerId = ownerType === 'user' ? userId : organizationId;

      const savedRows = await CheckImportService.saveRows({
        importId,
        ownerId,
        ownerType,
        rows,
      });

      res.send(savedRows);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /checks-import/submitRows/{ownerType}:
 *   post:
 *     summary: Submit selected import rows
 *     description: Submits specified rows of an import for a user or organization. Typically used to mark rows as ready for processing.
 *     tags:
 *       - Check Imports
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Type of the import owner (user or organization).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               importId:
 *                 type: string
 *                 description: ID of the import to which the rows belong.
 *               rowIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of row IDs to submit.
 *             required:
 *               - importId
 *               - rowIds
 *     responses:
 *       200:
 *         description: Successfully submitted the selected rows.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 description: Submitted row data.
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message describing the server issue.
 */

router.post(
  '/submitRows/:ownerType',
  async (req: SynccosRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      const organizationId = req.organizationId;
      const { ownerType } = req.params;
      const { importId, rowIds } = req.body;
      const ownerId = ownerType === 'user' ? userId : organizationId;

      const submittedRows = await CheckImportService.submitRows({
        importId,
        ownerId,
        rowIds,
        ownerType,
      });

      res.send(submittedRows);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /checks-import/import/{ownerType}:
 *   post:
 *     summary: Upload and import check data
 *     description: Uploads a file and initiates import of check data for a user or organization.
 *     tags:
 *       - Check Imports
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Type of the import owner (user or organization).
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               bankId:
 *                 type: string
 *                 description: ID of the bank account to associate with the import.
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: One or more files to upload for import.
 *             required:
 *               - bankId
 *               - files
 *     responses:
 *       200:
 *         description: Successfully imported the file data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Imported data response.
 *       400:
 *         description: No files uploaded or invalid request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No files uploaded
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message describing the server issue.
 */

router.post(
  '/import/:ownerType',
  upload.array('files'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      const organizationId = req.organizationId;
      const { ownerType } = req.params;
      const { bankId } = req.body;
      const ownerId = ownerType === 'user' ? userId : organizationId;

      const files = req.files as Express.Multer.File[];

      if (!files?.length) {
        res.status(400).json({ error: 'No files uploaded' });
        return;
      }

      const formattedFiles = files.map((file) => ({
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      }));

      const importedData = await CheckImportService.createCheckImport({
        ownerId,
        ownerType: ownerType as OwnerType,
        userId,
        bankId,
        file: formattedFiles[0],
      });

      res.send(importedData);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /checks-import/download/{ownerType}:
 *   get:
 *     summary: Get a download URL for an import file
 *     description: Returns a URL for downloading the file associated with a specific import for a user or organization.
 *     tags:
 *       - Check Imports
 *     parameters:
 *       - in: path
 *         name: ownerType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, organization]
 *         description: Type of the import owner (user or organization).
 *       - in: query
 *         name: importId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the import whose file should be downloaded.
 *     responses:
 *       200:
 *         description: Successfully generated the download URL.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fileUrl:
 *                   type: string
 *                   format: uri
 *                   description: Signed URL to download the import file.
 *                 fileName:
 *                   type: string
 *                   example: export_12345.csv
 *                   description: Suggested file name for the download.
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message describing the server issue.
 */

router.get(
  '/download/:ownerType',
  async (req: SynccosRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      const organizationId = req.organizationId;
      const { ownerType } = req.params;
      const ownerId = ownerType === 'user' ? userId : organizationId;

      const { importId } = req.query;

      const currentImport = await CheckImportService.getImportById(importId);
      const fileUrl = await CheckImportService.downloadImportFile({
        importId: importId as string,
        ownerId: ownerId as string,
        ownerType,
      });

      res.send({ fileUrl, fileName: currentImport?.fileName });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /checks-import/import/{importId}:
 *   get:
 *     summary: Retrieve a specific import by ID
 *     description: Fetches the details of a specific import using its unique ID.
 *     tags:
 *       - Check Imports
 *     parameters:
 *       - in: path
 *         name: importId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the import to retrieve.
 *     responses:
 *       200:
 *         description: Successfully retrieved the import details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 checkImport:
 *                   type: object
 *                   description: The import record.
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message describing the server issue.
 */

router.get(
  '/import/:importId',
  async (req: SynccosRequest, res: Response, next: NextFunction) => {
    try {
      const { importId } = req.params;

      const checkImport = await CheckImportService.getImportById(importId);
      res.send({ checkImport });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }
);

router.get('/download-template', async (req: SynccosRequest, res: Response) => {
  try {
    const filePath = CheckImportService.downloadTemplate();

    res.download(filePath, 'check_import_template.csv');
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

export default router;
