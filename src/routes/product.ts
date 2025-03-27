import { Router } from 'express';
const router = Router();
import {
  createProduct,
  getProductById,
  getAllProducts,
  updateProductQuantityById,
  updateProductDetailsById,
  getBestSellingProducts,
  updateCancelledProductQuantityById,
} from '../controllers/ProductController';
import { authentication } from '../middlewares/auth';

router.post('/create', createProduct);
router.get('/retrieve', getAllProducts);
router.get('/best-sellers', getBestSellingProducts);
router.get('/:id', getProductById);
router.post('/update/:id', updateProductQuantityById);
router.post('/update-cancel/:id', updateCancelledProductQuantityById);
router.put('/update-details/:id', updateProductDetailsById);

export default router;
