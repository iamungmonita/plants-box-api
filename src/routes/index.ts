import { Router } from 'express';

import authRoute from './auth';
import { FileRoute } from './file';
import logRoute from './log';
import membershipRoute from './membership';
import orderRoute from './order';
import productRoute from './product';
import systemRoute from './system';
import downloadRoute from './download';
import { authentication } from '../middlewares/auth';

export class AppRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use('/auth', authRoute);
    this.router.use('/order', authentication, orderRoute);
    this.router.use('/download', downloadRoute);
    this.router.use('/system', authentication, systemRoute);
    this.router.use('/membership', authentication, membershipRoute);
    this.router.use('/product', authentication, productRoute);
    this.router.use('/log', authentication, logRoute);
    this.router.use('/file', new FileRoute().router);
  }
}
