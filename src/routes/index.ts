import { Router } from 'express';

import authRoute from './auth';
import logRoute from './log';
import membershipRoute from './membership';
import orderRoute from './order';
import productRoute from './product';
import systemRoute from './system';

class AppRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use('/auth', authRoute);
    this.router.use('/order', orderRoute);
    this.router.use('/system', systemRoute);
    this.router.use('/membership', membershipRoute);
    this.router.use('/product', productRoute);
    this.router.use('/log', logRoute);
  }
}

export default new AppRouter().router;
