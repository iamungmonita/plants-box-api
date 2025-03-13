import { Response, Request } from "express";
import { Count, Logged } from "../models/log";

// Adjust with your actual model import

export const initialCount = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { counter, usd, khr, riels, dollars } = req.body;

  try {
    // Validate that either USD or KHR is provided
    if (!khr && !usd) {
      res.status(400).json({
        errors: [
          { name: "usd", message: "Either USD or KHR must be filled" },
          { name: "khr", message: "Either USD or KHR must be filled" },
        ],
      });
      return;
    }
    if (khr && khr < 100) {
      res.status(400).json({
        name: "khr",
        message: "Cambodian riels must be more than 100",
      });
      return;
    }

    if (!counter) {
      res.status(400).json({ message: "Counter is required" });
      return;
    }

    // Proceed with creating the initial log entry
    const initialLog = await Count.create({
      usd,
      khr,
      counter,
      riels,
      dollars,
    });

    // Send success response
    res.status(200).json(initialLog);
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: "Internal server error" });
  }
};
export const retrieveCount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const counter = await Count.find();
    res.status(200).json(counter);
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: "Internal server error" });
  }
};

export const DailyLogged = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.body;

  try {
    if (!userId) {
      res.status(400).json({ message: "you are not our staff" });
      return;
    }
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Count logins for today
    const todayLogins = await Logged.countDocuments({
      timestamp: { $gte: startOfDay },
    });

    // Log the new login
    const newLogin = new Logged({ userId });
    await newLogin.save();

    // First login?
    const isFirstLogin = todayLogins === 0;

    res.json(isFirstLogin);
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: "Internal server error" });
  }
};
