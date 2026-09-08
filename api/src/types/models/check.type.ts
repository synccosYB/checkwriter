import { IPayee } from "./payee.type";
export interface ICheck extends Document {
  status: string;
  ownerId: string;
  ownerType: string;
  checkNumber: number;
  invoiceId?: string;
  amount?: number;
  createdDate: Date;
  issuedDate?: Date;
  payeeId?: string;
  bankId?: string;
  address?: any;
  tags?: string[];
  memo?: string;
  description?: string;
  createdAtUnix?: number;
  updatedAtUnix?: number;
  pdfStored?: boolean;
  isSignatureSelected: boolean;
  isBlankCheck: boolean;
  importId?: string;
  qbCheckId?: string;
  createdAt: Date;
  updatedAt: Date;
}
