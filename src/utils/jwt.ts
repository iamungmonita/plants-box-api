import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import moment from 'moment';

import { ErrorCode } from '../enums';
import { UnauthorizedError } from '../libs';

// export function generateAccessToken(userId: number | string, expiresIn: string | number): string {
//   const secret = process.env.JWT_SECRET ?? ('JWT_SECRET' as string);
//   return jwt.sign({ userId, expiresIn }, secret);
// }

export function signJWT(payload: string | Buffer | object, expiresIn: string | number): string {
  const secret: Secret = process.env.JWT_SECRET ?? 'default_secret_key';

  // Explicitly cast expiresIn to the correct type
  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, secret, options);
}

export function verifyJWTToken(token: string): Promise<string | jwt.JwtPayload | undefined> {
  return new Promise((resolve) => {
    jwt.verify(
      token,
      process.env.JWT_SECRET ?? '',
      (error, decoded: string | jwt.JwtPayload | undefined) => {
        if (error) {
          throw new UnauthorizedError('Invalid Access Token', ErrorCode.InvalidToken);
        }
        const decodedToken = jwt.decode(token) as jwt.JwtPayload;
        resolve(decodedToken);
      },
    );
  });
}

export function getJWTLifeTime() {
  const expiresInMinutes = process.env.JWT_LIFE_TIME ? parseInt(process.env.JWT_LIFE_TIME) : 20;
  const date = moment().add(expiresInMinutes, 'minutes').valueOf();
  return new Date(date).getTime();
}
