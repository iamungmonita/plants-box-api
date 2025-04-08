import { Response, Request, NextFunction } from 'express';
import { Expense, Role, Voucher } from '../models/system';
import moment from 'moment';
import { BadRequestError, MissingParamError, NotFoundError } from '../libs/exceptions';
import mongoose from 'mongoose';

export const createRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { name, remarks, codes, isActive } = req.body;
  try {
    if (!name || !codes || !isActive) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }
    if (!name) throw new MissingParamError('name');
    if (!codes) throw new MissingParamError('codes');
    if (!isActive) throw new MissingParamError('isActive');
    const role = await Role.create({
      name,
      codes,
      remarks,
      isActive,
      createdBy: req.admin,
      updatedBy: req.admin,
    });

    res.json({ data: role });
  } catch (error) {
    next(error);
  }
};

export const getRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const roles = await Role.find().populate('createdBy').populate('updatedBy');
    res.json({ data: roles });
  } catch (error) {
    next(error);
  }
};
export const getRoleById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid ID format');
    }
    const role = await Role.findOne({ _id: id, isActive: true });
    if (!role) {
      throw new NotFoundError('Role does not exist.');
    }
    res.json({ data: role });
  } catch (error) {
    next(error);
  }
};

export const updateRoleById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid ID format');
    }
    const role = await Role.findOne({ _id: id, isActive: true });
    if (!role) {
      throw new NotFoundError('Role does not exist.');
    }
    const updatedRole = await Role.findOneAndUpdate(
      { _id: id },
      { ...req.body, updatedBy: req.admin },
      {
        new: true,
        runValidators: true,
      },
    );
    res.json({ data: updatedRole });
  } catch (error) {
    next(error);
  }
};

export const createExpense = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { category, amount, remarks, supplier, date, ...data } = req.body;

  try {
    if (!amount) throw new MissingParamError('amount');
    if (!supplier) throw new MissingParamError('supplier');
    if (!category) throw new MissingParamError('category');
    if (!date) throw new MissingParamError('date');
    const expense = await Expense.create({
      amount,
      supplier,
      remarks,
      category,
      createdBy: req.admin,
      updatedBy: req.admin,
      ...data,
    });

    res.json({ data: expense });
  } catch (error) {
    next(error);
  }
};

export const getAllExpenses = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const expenses = await Expense.find().populate('createdBy').populate('updatedBy');
    res.json({ data: expenses });
  } catch (error) {
    next(error);
  }
};

export const getExpenseById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid ID format');
    }
    const expense = await Expense.findOne({ _id: id, isActive: true });

    if (!expense) {
      throw new NotFoundError('Expense does not exist.');
    }
    res.json({ data: expense });
  } catch (error) {
    next(error);
  }
};

export const updateExpenseById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid ID format');
    }
    const expense = await Expense.findOne({ _id: id, isActive: true });
    if (!expense) {
      throw new NotFoundError('Expense does not exist.');
    }
    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      { $set: { ...req.body, updatedBy: req.admin } },
      { new: true },
    );

    res.json({ data: updatedExpense });
  } catch (error) {
    next(error);
  }
};

export const getMonthlyExpenses = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const expenses = await Expense.aggregate([
      {
        $addFields: {
          localMonth: { $dateToString: { format: '%Y-%m', date: '$date' } },
        },
      },
      {
        $group: {
          _id: '$localMonth',
          totalExpense: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formattedExpenses = expenses.map((exp) => ({
      month: moment(exp._id, 'YYYY-MM').format('MMM'),
      expense: exp.totalExpense,
    }));

    res.json({ data: formattedExpenses });
  } catch (error: any) {
    next(error);
  }
};

export const createVoucher = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { validFrom, validTo, discount, barcode, ...data } = req.body;

  try {
    if (!barcode) throw new MissingParamError('barcode');
    if (!discount) throw new MissingParamError('discount');
    if (!validTo) throw new MissingParamError('validTo');
    if (!validFrom) throw new MissingParamError('validFrom');

    const now = new Date();
    const fromDate = new Date(validFrom);
    const toDate = new Date(validTo);

    const isExpired = now > toDate;
    const bodyParam = {
      createdBy: req.admin,
      updatedBy: req.admin,
      validFrom: fromDate,
      validTo: toDate,
      isExpired,
      discount,
      barcode,
      ...data,
    };
    const voucher = await Voucher.create(bodyParam);

    res.json({ data: voucher });
  } catch (error) {
    next(error);
  }
};

export const getAllVouchers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { search } = req.query;
  try {
    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
      ];
    }
    const vouchers = await Voucher.find(filter).populate('createdBy').populate('updatedBy');
    res.status(200).json({ data: vouchers });
  } catch (error) {
    next(error);
  }
};

export const getVoucherById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid ID format');
    }
    const voucher = await Voucher.findById(id);
    if (!voucher) {
      throw new NotFoundError('Voucher does not exist.');
    }
    res.json({ data: voucher });
  } catch (error) {
    next(error);
  }
};

export const updateVoucherByBarcode = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { barcode } = req.params;
  try {
    const updatedVoucher = await Voucher.findOneAndUpdate(
      { barcode: { $regex: new RegExp(`^${barcode}$`, 'i') } },
      { $set: { isActive: false } },
      { new: true },
    );

    const data = {
      updatedVoucher,
      updatedBy: req.admin,
    };

    res.json({ data: data });
  } catch (error) {
    next(error);
  }
};

export const updateVoucherById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { id } = req.params;
  const { validFrom, validTo } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid ID format');
    }
    const voucher = await Voucher.findOne({ _id: id });
    if (!voucher) {
      throw new NotFoundError('Voucher does not exist.');
    }
    let updateFields: any = { ...req.body };
    if (validFrom || validTo) {
      const now = new Date();
      const toDate = validTo ? new Date(validTo) : undefined;

      if (toDate) {
        updateFields.isExpired = now > toDate;
      }
    }

    const updatedVoucher = await Voucher.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true },
    );

    if (!updatedVoucher) {
      throw new NotFoundError('Voucher not found.');
    }

    res.json({
      data: {
        updatedVoucher,
        updatedBy: req.admin,
      },
    });
  } catch (error) {
    next(error);
  }
};
