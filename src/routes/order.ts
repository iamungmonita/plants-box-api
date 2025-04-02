import { Router } from 'express';
const router = Router();

import {
  cancelOrderById,
  createOrder,
  getMonthlySale,
  getOrderByRange,
  getOrderToday,
  getOrders,
  getPurchasedOrderByProductId,
  updateOrderById,
} from '../controllers/OrderController';

router.post('/create', createOrder);
router.get('/retrieve', getOrders);
router.get('/sale/monthly', getMonthlySale);
router.get('/retrieve/:purchasedId', getPurchasedOrderByProductId);
router.get('/order-today', getOrderToday);
router.get('/order-range', getOrderByRange);
router.put('/update-cancel/:id', cancelOrderById);
router.put('/update-retrieve/:id', updateOrderById);

export default router;
