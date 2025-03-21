import { TokenType } from '../../enums/TokenType';

export class AccessToken {
  accessToken: string;

  expiresIn: Date | number;

  userId: string;

  extraFields?: Map<string, any>;

  type: string;

  constructor(accessToken: string, expiresIn: Date | number, userId: string, type: string = TokenType.Bearer) {
    this.accessToken = accessToken;
    this.expiresIn = expiresIn;
    this.userId = userId;
    this.type = type;
  }
}
