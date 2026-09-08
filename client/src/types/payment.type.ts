import { Attachment } from "./attachment.types";

export interface PaymentLink {
 _id: string;
  recipientName: string;
  recipientEmail: string;
  createdAtUnix: number;
  amount: number;
  note: string;
  status: string;
  paidOn: string | null;
  attachments?: Attachment[];
}