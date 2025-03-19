import { Router } from 'express';
const router = Router();

import {
  createOrder,
  downloadOrdersExcel,
  fetchOrderByToday,
  fetchOrdersByRange,
  getOrders,
  getPurchasedOrderByProductId,
} from '../controllers/order';

router.post('/create', createOrder);
router.get('/retrieve', getOrders);
router.get('/download-excel', downloadOrdersExcel);
router.get('/retrieve/:purchasedId', getPurchasedOrderByProductId);
router.get('/order-today', fetchOrderByToday);
router.get('/order-range', fetchOrdersByRange);

export default router;
