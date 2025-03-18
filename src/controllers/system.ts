import { Response, Request } from "express";
import { Expense, Role, Voucher } from "../models/system";

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

export const createExpense = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { category, amount, remarks, supplier, createdBy, ...data } = req.body;

  try {
    if (!createdBy) {
      res.status(401).json({ message: "Unauthorized personnel." });
      return;
    }
    if (!amount || !supplier || !category) {
      res.status(400).json({ message: "These fields are required" });
      return;
    }
    const expense = await Expense.create({
      amount,
      supplier,
      remarks,
      category,
      createdBy,
      ...data,
    });

    res.status(200).json({ data: expense });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }
};

export const getAllExpenses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const expenses = await Expense.find();
    if (!expenses) {
      res.status(400).json({ message: "Error retrieving expenses" });
      return;
    }
    res.status(200).json({ data: expenses });
  } catch (error) {
    res.status(500).json({ message: "An unexpected error occurred" });
  }
};

export const createVoucher = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { createdBy, ...data } = req.body;
  try {
    if (!createdBy) {
      res.status(401).json({ message: "Unauthorized personnel." });
      return;
    }
    if (
      !data.barcode ||
      !data.discount ||
      !data.validFrom ||
      !data.validTo ||
      !data.isActive
    ) {
      res.status(400).json({ message: "These fields are required" });
      return;
    }
    const voucher = await Voucher.create({ createdBy, ...data });
    res.status(200).json({ data: voucher });
  } catch (error) {
    res.status(500).json({ message: "An unexpected error occurred" });
  }
};

export const getAllVouchers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { barcode } = req.query;
  try {
    const filter: any = {};

    if (barcode) {
      filter.$or = [
        { barcode: { $regex: barcode, $options: "i" } }, // Case-insensitive partial match for barcode
      ];
    }

    const vouchers = await Voucher.find(filter);
    if (!vouchers) {
      res.status(400).json({ message: "Error retrieving vouchers" });
      return;
    }
    res.status(200).json({ data: vouchers });
  } catch (error) {
    res.status(500).json({ message: "An unexpected error occurred" });
  }
};
