import { config } from '../config/config';
import { signJWT } from '../utils/jwt';

export class Token {
  id: string;
  firstName: string;

  constructor(id: string, firstName: string) {
    this.id = id;
    this.firstName = firstName;
  }

  generateToken() {
    const payload = { id: this.id, firstName: this.firstName };
    const expiration = config.tokenExpiration;

    const token = signJWT(payload, expiration)
    return token;
  };
}
