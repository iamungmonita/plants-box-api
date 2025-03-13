import { Response, Request } from "express";
import { Role } from "../models/system";
export const create = async (req: Request, res: Response): Promise<void> => {
  const { name, remarks, codes, isActive, createdBy } = req.body;

  try {
    if (!createdBy) {
      res.status(401).json({ message: "Unauthorized personnel." });
      return;
    }
    if (!name || !codes || !isActive) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }
    const role = await Role.create({
      name,
      codes,
      remarks,
      isActive,
      createdBy,
    });

    res.status(200).json({ data: role });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as any).code === 11000
    ) {
      res.status(400).json({ message: "Duplicate value detected" });
      return;
    }
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }
};

export const getRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const roles = await Role.find();
    if (!roles) {
      res.status(400).json({ message: "Error retrieving roles.." });
      return;
    }
    res.status(200).json({ data: roles });
  } catch (error) {
    res.status(500).json({ message: "An unexpected error occurred" });
  }
};
