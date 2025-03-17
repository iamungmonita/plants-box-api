import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    export interface Request {
      admin?: string | JwtPayload; // Adjust type as per your needs
    }
  }
}
