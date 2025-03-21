import { Response, Request } from 'express';
import { Membership } from '../models/membership';
import { User } from '../models/auth';

export const createMembership = async (req: Request, res: Response): Promise<void> => {
  const { type, phoneNumber, invoices, isActive, points } = req.body;

  try {
    const admin = await User.findById(req.admin);
    if (!admin) {
      res.status(401).json({ message: 'unauthorized personnel' });
      return;
    }
    if (!type || !phoneNumber || !isActive || !invoices || !points) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const membership = await Membership.create({
      phoneNumber,
      type,
      isActive,
      invoices,
      points,
      createdBy: admin._id,
    });

    if (!membership) {
      res.status(400).json({ message: 'cannot created membership' });
      return;
    }
    res.status(200).json({ message: 'Created successfully', data: membership });
  } catch (error) {
    if (error instanceof Error && 'code' in error && (error as any).code === 11000) {
      res.status(400).json({
        name: 'phoneNumber',
        message: `This phone number is already registered`,
      });
      return;
    } else {
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
  }
};

export const getAllMembership = async (req: Request, res: Response): Promise<void> => {
  const { search, type } = req.query;
  try {
    const filter: any = {};
    if (search) {
      filter.$or = [
        { phoneNumber: { $regex: search, $options: 'i' } }, // Case-insensitive partial match for name
      ];
    }
    if (type) {
      Object.assign(filter, { type }); // Exact match since it's an autocomplete value
    }

    const membership = await Membership.find(filter);
    const count = membership.length;
    const profile = {
      member: membership,
      count: count,
    };
    res.status(200).json({ data: profile });
  } catch (error) {
    res.status(400).json(error);
  }
};
export const getMembershipById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.body;

  try {
    if (!id) {
      res.status(400).json({ message: 'ID is required.' });
      return;
    }
    const member = await Membership.findById(id);
    if (!member) {
      res.status(400).json({ message: 'Member does not exist.' });
    }
    res.status(200).json({ data: member });
  } catch (error) {
    res.status(400).json(error);
  }
};

export const updateMembershipPointsByPhoneNumber = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const admin = await User.findById(req.admin);
    if (!admin) {
      res.status(401).json({ message: 'unauthorized personnel' });
      return;
    }

    const { phoneNumber } = req.params;

    if (!phoneNumber) {
      res.status(400).json({ message: 'Phone Number is required' });
      return;
    }
    const pointsToSet = req.body.points ?? 0;
    const roundedPoints = parseFloat(pointsToSet).toFixed(2);
    const newInvoices = Array.isArray(req.body.invoice) ? req.body.invoice : [req.body.invoice]; // Convert string to array
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
      res.status(404).json({ message: 'Member not found' });
      return;
    }

    const data = {
      newPoints,
      updatedBy: admin._id,
    };

    res.status(200).json({ data: data });
  } catch (error) {
    console.error('Error updating product stock:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};
