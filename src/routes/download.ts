import { Router } from 'express';
const router = Router();

import { downloadOrdersExcel } from '../controllers/OrderController';

router.get('/download-excel', downloadOrdersExcel);

export default router;
