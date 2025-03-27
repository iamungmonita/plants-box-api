import { Router } from 'express';
const router = Router();

import {
  cancelOrderById,
  createOrder,
  downloadOrdersExcel,
  fetchOrderByToday,
  fetchOrdersByRange,
  getMonthlySale,
  getOrders,
  getPurchasedOrderByProductId,
  retrieveOrderById,
} from '../controllers/OrderController';

router.post('/create', createOrder);
router.get('/retrieve', getOrders);
router.get('/sale/monthly', getMonthlySale);
router.get('/retrieve/:purchasedId', getPurchasedOrderByProductId);
router.get('/order-today', fetchOrderByToday);
router.get('/order-range', fetchOrdersByRange);
router.put('/update-cancel/:id', cancelOrderById);
router.put('/update-retrieve/:id', retrieveOrderById);

export default router;
