import { Response, Request, NextFunction } from 'express';
import { CountLog, Log } from '../models/log';
import { User } from '../models/auth';
import { BadRequestError, NotFoundError } from '../libs/exceptions';

export const createLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { riels, dollars, rielTotal, dollarTotal } = req.body;

  try {
    const admin = await User.findById(req.admin);
    if (!admin) {
      throw new NotFoundError('Admin does not exist.');
    }

    const log = await Log.create({
      createdBy: admin?._id,
      riels,
      dollars,
      rielTotal,
      dollarTotal,
    });
    if (!log) {
      throw new BadRequestError('Error creating log.');
    }
    res.json({ data: log });
  } catch (error) {
    next(error);
  }
};

export const getLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const admin = await User.findById(req.admin);
    if (!admin) {
      throw new NotFoundError('Admin does not exist.');
    }
    const log = await Log.find().populate('createdBy');
    res.json({ data: log });
  } catch (error) {
    next(error);
  }
};

export const initialCount = async (userId: string): Promise<boolean> => {
  if (!userId) {
    return false;
  }
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayLogins = await CountLog.countDocuments({
    createdAt: { $gte: startOfDay },
  });
  const isFirstLogin = todayLogins === 0;
  await CountLog.create({ userId });
  return isFirstLogin;
};
