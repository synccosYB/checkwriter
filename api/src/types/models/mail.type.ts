import { ICheck } from "./check.type";

export interface IMailedCheck extends Document {
  ownerId: string;
  ownerType: 'user' | 'organization';
  checkId: string;
  batchId?: string;
  status: 'Submitted' | 'Processing' | 'Mailed' | 'Canceled' | 'Error';
  requestedAt: Date;
  requestedBy: string;
  processedAt?: Date;
  mailedAt?: Date;
  canceledAt?: Date;
  chargeAmount: number;
  invoiceId?: string;
  processedBy?: string;
  chargeId?: string;
  mailedBy?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface IMailedCheckPopulated extends Omit<IMailedCheck, 'checkId'> {
  checkId: {
    checkNumber: string;
    amount: number;
    payeeId: {
      name: string;
    };
  };
}
