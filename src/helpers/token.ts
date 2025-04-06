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
    const expirationInSeconds = config.getTokenExpirationInSeconds();
    const token = signJWT(payload, expirationInSeconds);
    return token;
  }
}
