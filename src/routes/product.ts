import { Router } from 'express';

import {
  createProduct,
  getAllProducts,
  getBestSellingProducts,
  getProductById,
  updateProductDetailsById,
  updateProductQuantityById,
} from '../controllers/product';

const router = Router();
router.post('/create', createProduct);
router.get('/retrieve', getAllProducts);
router.get('/best-sellers', getBestSellingProducts);
router.get('/:id', getProductById);
router.post('/update/:id', updateProductQuantityById);
router.put('/update-details/:id', updateProductDetailsById);

export default router;
