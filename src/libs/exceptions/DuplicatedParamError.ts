import { HttpErrorCode } from '../../enums';
import { HttpError } from '../HttpError';

export class DuplicatedParamError extends HttpError {
  constructor(param: string, errorCode?: number) {
    super(
      'VALIDATION_ERROR',
      HttpErrorCode.ValidationError,
      `This ${param} is already registered`,
      errorCode,
    );
  }
}
