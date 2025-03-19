import { Router } from 'express';
const router = Router();
import {
  authentication,
  fetchProfile,
  getUserById,
  getUsers,
  signIn,
  signOut,
  signUp,
  updateUserById,
} from '../controllers/auth';

router.post('/sign-up', signUp);
router.post('/sign-out', signOut);
router.post('/sign-in', signIn);
router.get('/profile', authentication, fetchProfile);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.get('/users/', getUsers);
router.put('/users/update/:id', updateUserById);

export default router;
