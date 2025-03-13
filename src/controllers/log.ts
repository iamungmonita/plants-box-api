import { Response, Request } from "express";
import { CountLog, Log } from "../models/log";

export const createLog = async (req: Request, res: Response): Promise<void> => {
  const { createdBy, riels, dollars } = req.body;
  try {
    if (!createdBy) {
      res.status(401).json({ message: "Unauthorized personnel." });
      return;
    }
    const log = await Log.create({
      createdBy,
      riels,
      dollars,
    });
    if (!log) {
      res.status(400).json({ message: "cannot create log" });
      return;
    }
    res.status(200).json({ data: log });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const log = await Log.find();
    res.status(200).json({ data: log });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
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
