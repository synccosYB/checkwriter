import {
  ICheckImport,
  ICheckImportRow,
} from '../../services/checkImport.schema';

export type ValidationFields = 'amount' | 'checkNumber' | 'payeeId';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ImportFile {
  buffer: Buffer<ArrayBufferLike>;
  originalname: string;
  mimetype: string;
  size: number;
}

export interface ParsedRow {
  checkNumber?: string;
  amount?: string;
  payeeName?: string;
  note?: string;
  invoiceId?: string;
  issueDate?: string;
}

export interface BaseInfo {
  ownerType: ICheckImport['ownerType'];
  ownerId: string;
}

export interface GetImportRequest extends BaseInfo {
  importId: string;
}

export interface CancelImportRequest extends GetImportRequest {}

export interface ListImportsRequest extends BaseInfo {
  status?: ICheckImport['status'];
}

export interface GetImportRowsRequest extends GetImportRequest {
  shouldPopulate?: boolean;
}

export interface FinalizeImportRequest extends GetImportRequest {}

export interface DownLoadImportRequest extends GetImportRequest {}

export interface ExportRequest extends GetImportRequest {}

export interface GetBankRequest extends BaseInfo {
  bankId: string;
}

export interface GetCheckRequest extends BaseInfo {
  checkNumber: number;
  bankId: string;
}

export interface ValidateCheckNumberRequest extends GetBankRequest {
  checkNumber: number;
  checkForDuplicateCheckNumber?: boolean;
  importId: string;
}

export interface ValidatePayeeRequest extends BaseInfo {
  payeeId?: string;
  payeeName: string;
}

export interface SaveRowRequest extends GetImportRequest {
  rows: ICheckImportRow[];
}

export interface SubmitRowRequest extends GetImportRequest {
  rowIds: string[];
}

export interface CreateCheckViaImport {
  importId: string;
  row: ICheckImportRow;
  bankId: string;
}

export interface SuggestPayeeIdRequest extends BaseInfo {
  name: string;
}

export interface ValidateRowRequest {
  row: ICheckImportRow;
  checkForDuplicateCheckNumber?: boolean;
  bankId: string;
}

export interface PreLoadCacheRequest extends BaseInfo {
  bankId: string;
  checkNumbers: Array<string | number>;
  payees: Array<{ name: string; payeeId?: string }>;
}
