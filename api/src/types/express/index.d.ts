import 'express';
import { Request } from 'express';

type OwnerType = 'user' | 'organization';
declare module 'express-serve-static-core' {
  interface Request {
    files?: Express.Multer.File[];
    params: {
      ownerType: OwnerType;
      [key: string]: string;
    };
    query: {
      [key: string]: string;
    };
    body: {
      [key: string]: any;
    };
    userId: string;
    organizationId: string;
    isDemo: boolean;
  }
}

export interface SynccosRequest extends Request {
  params: {
    ownerType: OwnerType;
    [key: string]: string;
  };
  query: {
    [key: string]: string;
  };
  body: {
    [key: string]: any;
  };
  userId?: string;
  organizationId?: string;
  files?: Express.Multer.File[];
}
