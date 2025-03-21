import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import { config } from '../config/config'; // Import the config file
import { saveBase64Image } from '../helpers/file';
import { User } from '../models/auth';
import { initialCount } from './LogController';
import { Token } from '../helpers/token';
import { BadRequestError, MissingParamError } from '../libs';

export const signUp = async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, role, codes, email, password, phoneNumber, isActive, pictures } =
    req.body;
  try {
    const admin = await User.findById(req.admin);
    if (!admin) {
      res.status(401).json({ message: 'unauthorized personnel' });
      return;
    }

    if (!firstName || !lastName || !role || !email || !password || !phoneNumber || !codes) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

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
      role,
      password: hashedPassword,
      isActive,
      codes,
      pictures: savedImages,
      createdBy: admin._id,
    });

    if (!user) {
      res.status(400).json({ message: 'Error creating user.' });
      return;
    }

    res.status(200).json({ data: user });
  } catch (error) {
    if (error instanceof Error && 'code' in error && (error as any).code === 11000) {
      res.status(400).json({
        name: 'email',
        message: `This email already registered`,
      });
      return;
    } else {
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
  }
};

export const signIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
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

// export const signOut = async (req: Request, res: Response): Promise<void> => {
//   try {
//     setCookie(res, config.authTokenName, '', { maxAge: 0 });
//     res.status(200).json({ message: 'sign out successfully' });
//     return;
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ message: 'Internal server error' });
//     return;
//   }
// };

export const fetchProfile = async (req: Request, res: Response) => {
  const admin = await User.findById(req.admin);
  if (!admin) {
    res.status(401).json({ message: 'unauthorized personnel' });
    return;
  }

  res.status(200).json({ data: admin });
  return;
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find();
    res.status(200).json({ data: users });
  } catch (error) {
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    if (!id) {
      res.status(400).json({ message: 'ID is required.' });
      return;
    }
    const user = await User.findById(id);
    if (!user) {
      res.status(400).json({ message: 'User does not exist.' });
      return;
    }
    res.status(200).json({ data: user });
  } catch (error) {
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
};

export const updateUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const admin = await User.findById(req.admin);
    if (!admin) {
      res.status(401).json({ message: 'unauthorized personnel' });
      return;
    }
    const { id } = req.params;
    const { pictures, ...data } = req.body;
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ message: 'User is not found' });
      return;
    }

    const updateData = { ...data };
    updateData.updatedBy = admin._id; // Explicitly include createdBy

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
    if (updatedUser) {
      res.status(200).json({ data: updatedUser });
    }
  } catch (error) {
    console.error('Error updating product stock:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};
