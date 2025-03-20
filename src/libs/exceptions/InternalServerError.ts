import { HttpErrorCode } from '../../enums';
import { HttpError } from '../HttpError';

export class InternalServerError extends HttpError {
  constructor(message: string, errorCode?: number) {
    super('INTERNAL_SERVER_ERROR', HttpErrorCode.InternalServerError, message, errorCode);
  }
}
