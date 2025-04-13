import { Response, Request, NextFunction } from 'express';
import { CountLog, Log } from '../models/log';
import { BadRequestError } from '../libs/exceptions';

export const createLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { riels, dollars, rielTotal, dollarTotal } = req.body;

  try {
    const log = await Log.create({
      createdBy: req.admin,
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
    const log = await Log.find().populate('createdBy').sort({ createdAt: -1 });
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
