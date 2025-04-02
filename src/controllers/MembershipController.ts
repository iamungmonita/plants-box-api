import { Response, Request, NextFunction } from 'express';
import { Membership } from '../models/membership';
import { User } from '../models/auth';
import {
  BadRequestError,
  DuplicatedParamError,
  MissingParamError,
  NotFoundError,
} from '../libs/exceptions';

export const createMembership = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { type, phoneNumber, invoices, isActive, points } = req.body;

  try {
    const admin = await User.findById(req.admin);
    if (!admin) {
      throw new NotFoundError('Admin does not exist.');
    }
    if (!type) throw new MissingParamError('type');
    if (!phoneNumber) throw new MissingParamError('phoneNumber');
    if (!isActive) throw new MissingParamError('isActive');
    if (!invoices) throw new MissingParamError('invoices');
    if (!points) throw new MissingParamError('points');

    const membership = await Membership.create({
      phoneNumber,
      type,
      isActive,
      invoices,
      points,
      createdBy: admin._id,
      updatedBy: admin._id,
    });

    if (!membership) {
      throw new BadRequestError('Error creating membership.');
    }

    res.json({ data: membership });
  } catch (error) {
    const err = error as { code?: number };
    if (err.code === 11000) {
      next(new DuplicatedParamError('phoneNumber', 11000));
    } else {
      next(error);
    }
  }
};

export const getAllMembership = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { search, type } = req.query;
  try {
    const filter: any = {};
    const admin = await User.findById(req.admin);
    if (!admin) {
      throw new NotFoundError('Admin does not exist.');
    }
    if (search) {
      filter.$or = [
        { phoneNumber: { $regex: search, $options: 'i' } }, // Case-insensitive partial match for name
      ];
    }
    if (type) {
      Object.assign(filter, { type }); // Exact match since it's an autocomplete value
    }

    const membership = await Membership.find(filter).populate('createdBy');
    const count = membership.length;
    const profile = {
      member: membership,
      count: count,
    };
    res.json({ data: profile });
  } catch (error) {
    next(error);
  }
};
export const getMembershipById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { id } = req.params;
  try {
    const admin = await User.findById(req.admin);
    if (!admin) {
      throw new NotFoundError('Admin does not exist.');
    }
    const member = await Membership.findById(id);
    if (!member) {
      throw new NotFoundError('Membership does not exist.');
    }
    res.json({ data: member });
  } catch (error) {
    next(error);
  }
};

export const updateMembershipPointsByPhoneNumber = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { phoneNumber } = req.params;
  const { points, invoice } = req.body;
  try {
    const admin = await User.findById(req.admin);
    if (!admin) {
      throw new NotFoundError('Admin does not exist.');
    }
    const pointsToSet = points ?? 0;
    const roundedPoints = parseFloat(pointsToSet).toFixed(2);
    const newInvoices = Array.isArray(invoice) ? invoice : [invoice]; // Convert string to array
    const newPoints = await Membership.findOneAndUpdate(
      { phoneNumber: phoneNumber },
      {
        $set: {
          points: roundedPoints, // ✅ Set new points value
          invoices: newInvoices, // ✅ Replace `invoices` array instead of appending
        },
      },

      { new: true, runValidators: true },
    );
    if (!newPoints) {
      throw new BadRequestError('Error updating points.');
    }

    const data = {
      newPoints,
      updatedBy: admin._id,
    };

    res.json({ data: data });
  } catch (error) {
    next(error);
  }
};

export const updateMembershipById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { phoneNumber, isActive } = req.body;
  try {
    const admin = await User.findById(req.admin);
    if (!admin) {
      throw new NotFoundError('Admin does not exist.');
    }
    const membership = await Membership.findById(id);

    if (!membership) {
      throw new NotFoundError('Membership does not exist.');
    }

    const updatedInfo = await Membership.findByIdAndUpdate(
      id,
      { $set: { phoneNumber: phoneNumber, isActive: isActive } },
      {
        new: true,
        runValidators: true,
      },
    );
    if (!updatedInfo) {
      throw new BadRequestError('Error updating membership.');
    }
    res.json({ data: updatedInfo });
  } catch (error) {
    next(error);
  }
};
