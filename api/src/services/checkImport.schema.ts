/**
 * @swagger
 * components:
 *   schemas:
 *     CheckImportRow:
 *       type: object
 *       properties:
 *         importId:
 *           type: string
 *           format: uuid
 *         ownerType:
 *           type: string
 *           enum: [user, organization]
 *         ownerId:
 *           type: string
 *           format: uuid
 *         rowNumber:
 *           type: integer
 *         originalCheckNumber:
 *           type: string
 *         originalAmount:
 *           type: string
 *         originalPayeeName:
 *           type: string
 *         originalNote:
 *           type: string
 *         originalInvoiceId:
 *           type: string
 *         originalIssueDate:
 *           type: string
 *           format: date-time
 *         finalCheckNumber:
 *           type: number
 *         finalAmount:
 *           type: number
 *         finalPayeeId:
 *           type: string
 *           format: uuid
 *         suggestedPayeeId:
 *           type: string
 *           format: uuid
 *         finalNote:
 *           type: string
 *         finalInvoiceId:
 *           type: string
 *         finalIssueDate:
 *           type: string
 *           format: date-time
 *         validationErrors:
 *           type: object
 *         state:
 *           type: string
 *           enum: [valid, invalid, submitted, skipped]
 *         checkId:
 *           type: string
 *           format: uuid
 *         submittedAt:
 *           type: string
 *           format: date-time
 *         submittedBy:
 *           type: string
 *           format: uuid
 *     CheckImport:
 *       type: object
 *       properties:
 *         ownerType:
 *           type: string
 *           enum: [user, organization]
 *         ownerId:
 *           type: string
 *           format: uuid
 *         createdBy:
 *           type: string
 *           format: uuid
 *         fileName:
 *           type: string
 *         status:
 *           type: string
 *           enum: [In Review, Completed, Canceled, Submitted]
 *         bankAccountId:
 *           type: string
 *           format: uuid
 *         rowCounts:
 *           type: object
 *           properties:
 *             total:
 *               type: number
 *             valid:
 *               type: number
 *             invalid:
 *               type: number
 *             submitted:
 *               type: number
 *             skipped:
 *               type: number
 */

interface IRowCounts {
  total: number;
  valid: number;
  invalid: number;
  submitted: number;
  skipped: number;
}

export interface ICheckImport {
  _id?: string;
  ownerType: 'user' | 'organization';
  ownerId: string;
  createdBy: string;
  fileName: string;
  status: 'In Review' | 'Completed' | 'Canceled' | 'Submitted';
  bankAccountId: string;
  rowCounts: IRowCounts;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICheckImportRow {
  _id?: string;
  __v?: number;
  importId: string;
  ownerType: 'user' | 'organization';
  ownerId: string;
  rowNumber: number;
  originalCheckNumber: string;
  originalAmount: string;
  originalPayeeName: string;
  originalNote: string;
  originalInvoiceId: string;
  originalIssueDate: Date;
  finalCheckNumber: number;
  finalAmount: number;
  finalPayeeId: string;
  finalIssueDate: Date;
  suggestedPayeeId: string;
  finalNote: string;
  finalInvoiceId: string;
  validationErrors: Record<string, string[]>;
  state: 'valid' | 'invalid' | 'submitted' | 'skipped';
  checkId: string;
  submittedAt: Date;
  submittedBy: string;
  createdAt: Date;
  updatedAt: Date;
}
