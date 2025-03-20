import { config } from '../config/config';
import jwt from 'jsonwebtoken';

export class Token {
  id: string;
  firstName: string;

  constructor(id: string, firstName: string) {
    this.id = id;
    this.firstName = firstName;
  }

  generateToken = (secretKey: string) => {
    const token = jwt.sign({ id: this.id, firstName: this.firstName }, secretKey, {
      expiresIn: config.tokenExpiration,
    });
    return token;
  };
}
