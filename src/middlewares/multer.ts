import express from 'express';
import Multer from 'multer';

import { BadRequestError } from '../libs';

export default (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const maxUploadFileSize = process.env.MAXIMUM_UPLOAD_SIZE ?? '20'; // MB
    const fileSize = parseInt(maxUploadFileSize) * 1024 * 1024;
    const multer = Multer({
      storage: Multer.memoryStorage(),
      limits: { fileSize },
    });

    const single = multer.single('file');

    return single(req, res, function (error) {
      if (error) {
        if (error.code == 'LIMIT_FILE_SIZE') {
          error = new BadRequestError(`File size must be smaller than ${maxUploadFileSize}MB`);
        }
        next(error);
      } else {
        next();
      }
    });
  } catch (error) {
    next(error);
  }
};
