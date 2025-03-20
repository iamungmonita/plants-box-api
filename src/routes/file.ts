import { Router } from 'express';

import { FileController } from '../controllers/FileController';
import { FileMulter } from '../middlewares';

export class FileRoute {
  public router: Router;
  readonly #controller: FileController;

  constructor() {
    this.router = Router();
    this.#controller = new FileController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/v1/upload', FileMulter, this.#controller.uploadSingleFile);
  }
}
