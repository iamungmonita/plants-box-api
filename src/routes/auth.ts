import { Router } from 'express';
const router = Router();
import {
  fetchProfile,
  getUserById,
  getUsers,
  signIn,
  signOut,
  signUp,
  updateUserById,
} from '../controllers/auth';
import { authentication } from '../middlewares/auth';

router.post('/sign-up', authentication, signUp);
router.post('/sign-out', signOut);
router.post('/sign-in', signIn);
router.get('/profile', authentication, fetchProfile);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.get('/users/', getUsers);
router.put('/users/update/:id', authentication, updateUserById);

export default router;
