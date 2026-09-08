import { getUser } from '../models/users.model.js';

export const userExistenceMiddleware = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await getUser({ _id: userId });

    if (!user) throw new Error('User not found');

    next();
  } catch (err) {
    next(err);
  }
};
