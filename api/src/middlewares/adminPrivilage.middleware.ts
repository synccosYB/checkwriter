import { Request, Response, NextFunction } from 'express';
import { usersCollection } from '../models/dbCollections';

const adminPrivilageMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const user = await usersCollection.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isAdmin = user.role === 'superadmin';
    if (!isAdmin) {
      return res
        .status(403)
        .json({ error: 'User is not authorized to perform this action.' });
    }

    return next();
  } catch (error: any) {
    console.error('Error in adminPrivilegeMiddleware:', error);
    return res
      .status(500)
      .json({ error: error?.message || 'Internal server error.' });
  }
};

export default adminPrivilageMiddleware;
