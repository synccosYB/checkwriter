import { OwnerType } from '../../enums/user.enum';


export enum PayeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}
export interface IPayee {
  _id?: string;
  name: string;
  nickName?: string;
  companyName?: string;
  address?: any;
  phone?: string;
  email?: string;
  ownerId: string;
  status: PayeeStatus;
  ownerType: OwnerType;
  createdAt: Date;
  updatedAt: Date;
}
