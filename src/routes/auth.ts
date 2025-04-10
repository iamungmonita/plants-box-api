import { Router } from 'express';

import {
  getAdmin,
  getUserById,
  getUsers,
  signIn,
  signUp,
  updateUserById,
  updateUserPasswordById,
} from '../controllers/AuthController';
import { authentication } from '../middlewares/auth';

const router = Router();
router.post('/sign-up', authentication, signUp);
router.post('/sign-in', signIn);
router.get('/profile', authentication, getAdmin);
router.get('/users', authentication, getUsers);
router.get('/users/:id', authentication, getUserById);
router.put('/users/update/:id', authentication, updateUserById);
router.put('/users/update-password/:id', authentication, updateUserPasswordById);

export default router;
