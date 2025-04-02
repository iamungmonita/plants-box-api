import { Router } from 'express';
const router = Router();
import {
  getAdmin,
  getUserById,
  getUsers,
  signIn,
  signUp,
  updateUserById,
} from '../controllers/AuthController';
import { authentication } from '../middlewares/auth';

router.post('/sign-up', authentication, signUp);
router.post('/sign-in', signIn);
router.get('/profile', authentication, getAdmin);
router.get('/users', authentication, getUsers);
router.get('/users/:id', authentication, getUserById);
router.put('/users/update/:id', authentication, updateUserById);

export default router;
