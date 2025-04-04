import dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';

import { TokenType } from '../enums/TokenType';
import { UnauthorizedError } from '../libs';
import { User } from '../models/auth';
import { verifyJWTToken } from '../utils/jwt';

dotenv.config();

export const authentication = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authorization = req.headers['authorization'];
    if (!authorization) {
      throw new UnauthorizedError('Authorization header is missing.');
    }

    // Extract token from the header
    const [bearer, token] = authorization.split(' ');
    if (bearer !== TokenType.Bearer || !token) {
      throw new UnauthorizedError('Invalid authorization format. Expected: "Bearer <token>".');
    }

    // Decoded JWT Payload
    const payload = (await verifyJWTToken(token)) as JwtPayload;
    if (!payload?.id) {
      throw new UnauthorizedError('Invalid token payload. Missing `userId`.');
    }

    // Validate If User has registered
    const userId = payload.id;
    const admin = User.findOne({ _id: userId, isActive: true });
    if (!admin) {
      throw new UnauthorizedError('Unauthorized user credential');
    }
    req.admin = userId;
    next();
  } catch (error) {
    next(error);
  }
};
