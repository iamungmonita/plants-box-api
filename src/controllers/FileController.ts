import express, { NextFunction, Request, Response } from 'express';
import { wrapAsync } from 'src/helpers/file';

import { MissingParamError } from '../libs/exceptions';
import { FileStorage } from '../utils/FileStorage';

export class FileController {
  async uploadSingleFile(
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) {
    try {
      const files = request.file;
      if (!files) {
        throw new MissingParamError('file');
      }

      const { folderName = '', fileName = '' } = request.body;
      const fileStorage = new FileStorage({ fileName, folderName, request });
      const file = await fileStorage.write();
      console.log(file);
      response.json(file);
    } catch (error) {
      next(error);
    }
  }
}
