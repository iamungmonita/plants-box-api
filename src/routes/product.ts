import { Router } from 'express';
const router = Router();
import {
  createProduct,
  getProductById,
  getAllProducts,
  updateProductQuantityById,
  updateProductDetailsById,
  getBestSellingProducts,
} from '../controllers/ProductController';
import { authentication } from '../middlewares/auth';

router.post('/create', authentication, createProduct);
router.get('/retrieve', getAllProducts);
router.get('/best-sellers', getBestSellingProducts);
router.get('/:id', getProductById);
router.post('/update/:id', updateProductQuantityById);
router.put('/update-details/:id', authentication, updateProductDetailsById);

export default router;
