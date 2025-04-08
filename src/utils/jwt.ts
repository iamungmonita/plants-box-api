import jwt, { SignOptions, Secret, JwtPayload } from 'jsonwebtoken';
import moment from 'moment';
import { ErrorCode } from '../enums';
import { UnauthorizedError } from '../libs';

export function signJWT(payload: string | Buffer | object, expiresIn: string | number): string {
  const secret: Secret = process.env.JWT_SECRET ?? 'default_secret_key';

  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, secret, options);
}

export function verifyJWTToken(token: string): Promise<JwtPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET ?? '', (error, decoded) => {
      if (error || !decoded || typeof decoded !== 'object') {
        return reject(new UnauthorizedError('Invalid Access Token', ErrorCode.InvalidToken));
      }

      const payload = decoded as JwtPayload;

      if (!payload.id) {
        return reject(
          new UnauthorizedError('Invalid token payload. Missing `userId`.', ErrorCode.InvalidToken),
        );
      }

      if (!payload.exp || payload.exp * 1000 < Date.now()) {
        return reject(new UnauthorizedError('Token has expired.', ErrorCode.InvalidToken));
      }

      resolve(payload);
    });
  });
}

export function getJWTLifeTime() {
  const expiresInMinutes = process.env.JWT_LIFE_TIME ? parseInt(process.env.JWT_LIFE_TIME) : 20;
  const date = moment().add(expiresInMinutes, 'minutes').valueOf();
  return new Date(date).getTime();
}
