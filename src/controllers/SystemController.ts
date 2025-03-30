import { Response, Request } from 'express';
import { Expense, Role, Voucher } from '../models/system';
import { User } from '../models/auth';
import moment from 'moment';

export const createRole = async (req: Request, res: Response): Promise<void> => {
  const { name, remarks, codes, isActive } = req.body;

  try {
    const admin = await User.findById(req.admin);
    if (!admin) {
      res.status(401).json({ message: 'unauthorized personnel' });
      return;
    }

    if (!name || !codes || !isActive) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }
    const role = await Role.create({
      name,
      codes,
      remarks,
      isActive,
      createdBy: admin._id,
    });

    res.status(200).json({ data: role });
  } catch (error) {
    if (error instanceof Error && 'code' in error && (error as any).code === 11000) {
      res.status(400).json({ message: 'Duplicate value detected' });
      return;
    }
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
};

export const getRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const admin = await User.findById(req.admin);
    if (!admin) {
      res.status(401).json({ message: 'unauthorized personnel' });
      return;
    }

    const roles = await Role.find().populate('createdBy');
    if (!roles) {
      res.status(400).json({ message: 'Error retrieving roles..' });
      return;
    }
    res.status(200).json({ data: roles });
  } catch (error) {
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
};
export const getRoleById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const admin = await User.findById(req.admin);
    if (!admin) {
      res.status(401).json({ message: 'unauthorized personnel' });
      return;
    }
    const role = await Role.findById(id);
    if (!role) {
      res.status(400).json({ message: 'Role this does not exist..' });
      return;
    }
    res.status(200).json({ data: role });
  } catch (error) {
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
};
export const updateRoleById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const admin = await User.findById(req.admin);
    if (!admin) {
      res.status(401).json({ message: 'unauthorized personnel' });
      return;
    }

    const role = await Role.findById(id);
    if (!role) {
      res.status(400).json({ message: 'Role this does not exist..' });
      return;
    }
    const updatedRole = await Role.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ data: updatedRole });
  } catch (error) {
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
};

export const createExpense = async (req: Request, res: Response): Promise<void> => {
  const { category, amount, remarks, supplier, ...data } = req.body;

  try {
    const admin = await User.findById(req.admin);
    if (!admin) {
      res.status(401).json({ message: 'unauthorized personnel' });
      return;
    }
    if (!amount || !supplier || !category) {
      res.status(400).json({ message: 'These fields are required' });
      return;
    }
    const expense = await Expense.create({
      amount,
      supplier,
      remarks,
      category,
      createdBy: admin._id,
      ...data,
    });

    res.status(200).json({ data: expense });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  }
};

export const getAllExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const admin = await User.findById(req.admin);
    if (!admin) {
      res.status(401).json({ message: 'unauthorized personnel' });
      return;
    }
    const expenses = await Expense.find().populate('createdBy');
    if (!expenses) {
      res.status(400).json({ message: 'Error retrieving expenses' });
      return;
    }
    res.status(200).json({ data: expenses });
  } catch (error) {
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
};

export const getMonthlyExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const expenses = await Expense.aggregate([
      {
        $addFields: {
          localMonth: { $dateToString: { format: '%Y-%m', date: '$date' } }, // Extract month and year from Date object
        },
      },
      {
        $group: {
          _id: '$localMonth', // Group by the formatted "YYYY-MM" string
          totalExpense: { $sum: '$amount' }, // Sum expenses per month
        },
      },
      { $sort: { _id: 1 } }, // Sort by month-year in ascending order
    ]);

    const formattedExpenses = expenses.map((exp) => ({
      month: moment(exp._id, 'YYYY-MM').format('MMM'), // Format as "Jan", "Feb", "Mar" (without year)
      expense: exp.totalExpense,
    }));

    res.status(200).json({ data: formattedExpenses });
  } catch (error: any) {
    console.error('Error fetching monthly expenses:', error);
    res.status(500).json({ message: 'An unexpected error occurred', error: error.message });
  }
};

export const createVoucher = async (req: Request, res: Response): Promise<void> => {
  const { validFrom, validTo, ...data } = req.body;

  try {
    const admin = await User.findById(req.admin);
    if (!admin) {
      res.status(401).json({ message: 'unauthorized personnel' });
      return;
    }
    if (!data.barcode || !data.discount || !validFrom || !validTo) {
      res.status(400).json({ message: 'These fields are required' });
      return;
    }

    // Convert validFrom and validTo to Date objects
    const now = new Date();
    const fromDate = new Date(validFrom);
    const toDate = new Date(validTo);

    const isExpired = now >= fromDate && now <= toDate;

    const voucher = await Voucher.create({
      createdBy: admin._id,
      validFrom: fromDate,
      validTo: toDate,
      isExpired: !isExpired,
      ...data,
    });

    res.status(200).json({ data: voucher });
  } catch (error) {
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
};

export const getAllVouchers = async (req: Request, res: Response): Promise<void> => {
  const { barcode } = req.query;
  try {
    const filter: any = {};
    const admin = await User.findById(req.admin);
    if (!admin) {
      res.status(401).json({ message: 'unauthorized personnel' });
      return;
    }
    if (barcode) {
      filter.$or = [
        { barcode: { $regex: barcode, $options: 'i' } }, // Case-insensitive partial match for barcode
      ];
    }

    const vouchers = await Voucher.find(filter).populate('createdBy');

    if (!vouchers) {
      res.status(400).json({ message: 'Error retrieving vouchers' });
      return;
    }
    res.status(200).json({ data: vouchers });
  } catch (error) {
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
};

export const getVoucherById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const admin = await User.findById(req.admin);
    if (!admin) {
      res.status(401).json({ message: 'unauthorized personnel' });
      return;
    }
    if (!id) {
      res.status(400).json({ message: 'ID is required' });
      return;
    }

    const voucher = await Voucher.findById(id);

    if (!voucher) {
      res.status(400).json({ message: 'Error retrieving vouchers' });
      return;
    }
    res.status(200).json({ data: voucher });
  } catch (error) {
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
};

export const updateVoucherByBarcode = async (req: Request, res: Response): Promise<void> => {
  const { barcode } = req.params;
  try {
    const admin = await User.findById(req.admin);
    if (!admin) {
      res.status(401).json({ message: 'unauthorized personnel' });
      return;
    }
    if (!barcode) {
      res.status(400).json({ message: 'Barcode is required' });
      return;
    }
    const updatedVoucher = await Voucher.findOneAndUpdate(
      { barcode: { $regex: new RegExp(`^${barcode}$`, 'i') } }, // Case-insensitive barcode match
      { $set: { isActive: false } }, // Set isActive to false
      { new: true }, // Return the updated document
    );
    if (!updatedVoucher) {
      res.status(404).json({ message: 'Voucher not found' });
      return;
    }
    const data = {
      updatedVoucher,
      updatedBy: admin._id,
    };

    res.json({ data: data });
  } catch (error) {
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
};

export const updateVoucherById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const admin = await User.findById(req.admin);
    if (!admin) {
      res.status(401).json({ message: 'unauthorized personnel' });
      return;
    }
    if (!id) {
      res.status(400).json({ message: 'ID is required' });
      return;
    }
    const updatedVoucher = await Voucher.findByIdAndUpdate(
      id,
      { $set: req.body }, // Set isActive to false
      { new: true }, // Return the updated document
    );
    if (!updatedVoucher) {
      res.status(404).json({ message: 'Voucher not found' });
      return;
    }
    const data = {
      updatedVoucher,
      updatedBy: admin._id,
    };

    res.json({ data: data });
  } catch (error) {
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
};
