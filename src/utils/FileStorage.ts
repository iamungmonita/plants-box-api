import { Request } from 'express';
import fs from 'fs';
import path from 'path';

import { BadRequestError, MissingParamError } from '../libs';

interface FileResponse {
  url: string;
  fileName: string;
}

interface FileStorageType {
  fileName: string;
  folderName: string;
  request: Request;
}

export class FileStorage {
  fileName = '';
  folderName = '';
  request: Request;
  file: Express.Multer.File;

  private readonly _publicPath = '/public';
  /**
   * @description - Base Directory where the file would be stored
   */
  private readonly _folderPath = './data/uploads';

  get storageUrl(): string {
    return process.env.STORAGE_URL ?? 'http://localhost:4002';
  }

  constructor(param: FileStorageType) {
    this.request = param.request;
    this.fileName = param.fileName;
    this.folderName = param.folderName;

    if (!this.request.file) {
      throw new MissingParamError('Files is empty!.');
    }
    this.file = this.request.file;
    if (!this._isAllowExtension(this.file)) {
      return;
    }
  }

  write(): Promise<FileResponse> {
    const dir = this._makeDir();
    const fileName = this._getFileName();
    const fileDir = path.join(dir, fileName);

    return new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(fileDir);

      writeStream.write(this.file.buffer, 'base64', (error) => {
        if (error) {
          console.error('Error writing to the file:', error);
          // Close the writable stream to finish writing
          writeStream.end();
          const err = new BadRequestError(`Error writing image ${error.message} to the file.`);
          reject(err); // Use native JavaScript reject here
        }
        const fileUrl = this.storageUrl.concat(fileDir).replace(this._publicPath, '');
        resolve({ url: fileUrl, fileName });
      });

      // Handle the 'finish' event for each stream
      writeStream.on('finish', () => {
        console.log(`Writing image ${fileDir} to the file is complete.`);
      });
    });
  }

  private _isAllowExtension(file: Express.Multer.File) {
    const fileExtReg = /\.(jpg|jpeg|svg|png|gif|pdf)$/i;
    // accept image files only
    if (!file.originalname.match(fileExtReg)) {
      throw new BadRequestError('Files extension are not allowed!.');
    }
    return true;
  }

  private _makeDir() {
    // Create DIR = public/ data/uploads/`profile`
    const filePath = path.join('./', this._publicPath, this._folderPath, this.folderName);
    fs.mkdirSync(filePath, { recursive: true });
    return filePath;
  }

  private _getFileName() {
    const fileName = this.fileName || this.request.file?.originalname;
    return `${Date.now()}-${fileName}`;
  }
}
