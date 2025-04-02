import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import { config } from '../config/config'; // Import the config file
import { saveBase64Image } from '../helpers/file';
import { User } from '../models/auth';
import { initialCount } from './LogController';
import { Token } from '../helpers/token';
import { BadRequestError, DuplicatedParamError, MissingParamError, NotFoundError } from '../libs';
import { Role } from '../models/system';

export const signUp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { firstName, lastName, role, codes, email, password, phoneNumber, isActive, pictures } =
    req.body;
  try {
    const admin = await User.findById(req.admin);
    if (!admin) {
      throw new NotFoundError('Admin does not exist.');
    }

    const position = await Role.findById(role);
    if (!position) {
      throw new NotFoundError('Role does not exist.');
    }

    if (!firstName || !lastName || !role || !email || !password || !phoneNumber || !codes) {
      throw new BadRequestError('All fields are required');
    }
    const fullName = `${firstName} ${lastName}`.trim(); // Combine first and last name

    const hashedPassword = await bcrypt.hash(password, 10);
    let savedImages = '';

    if (pictures && pictures !== '') {
      savedImages = await saveBase64Image(pictures, `product_${Date.now()}`);
    }

    const user = await User.create({
      email,
      phoneNumber,
      firstName,
      lastName,
      fullName,
      role: position._id,
      password: hashedPassword,
      isActive,
      codes,
      pictures: savedImages,
      createdBy: admin._id,
      updatedBy: admin._id,
    });

    if (!user) {
      throw new BadRequestError('Error creating user.');
    }

    res.json({ data: user });
  } catch (error) {
    const err = error as { code?: number };
    if (err.code === 11000) {
      next(new DuplicatedParamError('email', 11000));
    } else {
      next(error);
    }
  }
};

export const signIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, password } = req.body;

  try {
    if (!email) {
      throw new MissingParamError('email');
    }
    if (!password) {
      throw new MissingParamError('password');
    }

    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      throw new BadRequestError('User does not existed');
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new BadRequestError('Invalid Password');
    }

    const initialLog = await initialCount(user._id.toString());
    const token = new Token(user._id.toString(), user.firstName).generateToken(config.secretKey);
    const data = { token, initialLog };

    res.json({ data: data });
  } catch (error) {
    next(error);
  }
};

export const getAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = await User.findById(req.admin);
    if (!admin) {
      throw new NotFoundError('Admin does not existed');
    }
    res.json({ data: admin });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await User.find().populate('createdBy').populate('role').populate('updatedBy');
    res.json({ data: users });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError('User does not exist.');
    }

    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { id } = req.params;
  const { pictures, firstName, lastName, ...data } = req.body;

  try {
    const admin = await User.findById(req.admin);
    if (!admin) {
      throw new NotFoundError('Admin does not exist.');
    }
    const user = await User.findById(id);

    if (!user) {
      throw new NotFoundError('User does not exist.');
    }

    const updateData = { ...data };
    updateData.updatedBy = admin._id; // Explicitly include createdBy

    if (firstName !== undefined || lastName !== undefined) {
      updateData.firstName = firstName ?? user.firstName;
      updateData.lastName = lastName ?? user.lastName;
      updateData.fullName = `${updateData.firstName} ${updateData.lastName}`.trim();
    }

    if (pictures === null || pictures === '') {
      updateData.pictures = null; // Explicitly clear the pictures field
    } else if (pictures && pictures.startsWith('data:image')) {
      const savedImage = await saveBase64Image(pictures, `product_${Date.now()}`);
      updateData.pictures = savedImage; // Update with the new image
    } else {
      updateData.pictures = pictures;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      throw new BadRequestError('Error updating user.');
    }
    res.json({ data: updatedUser });
  } catch (error) {
    const err = error as { code?: number };
    if (err.code === 11000) {
      next(new DuplicatedParamError('email', 11000));
    } else {
      next(error);
    }
  }
};
