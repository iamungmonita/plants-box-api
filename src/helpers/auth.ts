import { BadRequestError, MissingParamError } from '../libs';
import bcrypt from 'bcryptjs';
import { User } from '../models/auth';

export const validation = async (email: string, password: string): Promise<boolean> => {
  if (!email) {
    throw new MissingParamError('email');
  }
  if (!password) {
    throw new MissingParamError('password');
  }

  const user = await User.findOne({ email, isActive: true });
  if (!user) {
    throw new BadRequestError('User does not exist');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new BadRequestError('Invalid password');
  }

  if (user.role && user.role._id.toString() === '67e912bf7e235b4a0a707500') {
    return true;
  } else {
    throw new BadRequestError('Unauthorized role');
  }
};
