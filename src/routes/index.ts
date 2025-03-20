import { Router } from 'express';

import authRoute from './auth';
import { FileRoute } from './file';
import logRoute from './log';
import membershipRoute from './membership';
import orderRoute from './order';
import productRoute from './product';
import systemRoute from './system';
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
    this.router.use('/system', systemRoute);
    this.router.use('/membership', membershipRoute);
    this.router.use('/product', productRoute);
    this.router.use('/log', logRoute);
    this.router.use('/file', new FileRoute().router);
  }
}
