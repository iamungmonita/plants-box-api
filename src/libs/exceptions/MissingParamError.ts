import { HttpErrorCode } from '../../enums';
import { HttpError } from '../HttpError';

export class MissingParamError extends HttpError {
  constructor(param: string, errorCode?: number) {
    super('BAD_REQUEST', HttpErrorCode.BadRequest, `Missing request param '${param}'`, errorCode);
  }
}
