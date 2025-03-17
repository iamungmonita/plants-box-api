import { Router } from 'express';

import {
  createOrder,
  fetchOrderByToday,
  fetchOrdersByRange,
  getOrders,
  getPurchasedOrderByProductId,
} from '../controllers/order';

const router = Router();
router.post('/create', createOrder);
router.get('/retrieve', getOrders);
router.get('/retrieve/:purchasedId', getPurchasedOrderByProductId);
router.get('/order-today', fetchOrderByToday);
router.get('/order-range', fetchOrdersByRange);

export default router;
