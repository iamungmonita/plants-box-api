import { HttpErrorCode } from '../../enums';
import { HttpError } from '../HttpError';

export class BadRequestError extends HttpError {
  constructor(message: string, errorCode?: number, payload?: any) {
    super('BAD_REQUEST', HttpErrorCode.BadRequest, message, errorCode, payload);
  }
}
