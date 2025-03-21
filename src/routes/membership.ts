import { Router } from 'express';
const router = Router();

import {
  createMembership,
  getAllMembership,
  getMembershipById,
  updateMembershipPointsByPhoneNumber,
} from '../controllers/MembershipController';
import { authentication } from '../middlewares/auth';

router.post('/create', authentication, createMembership);
router.get('/retrieve', getAllMembership);
router.get('/retrieve/:id', getMembershipById);
router.put('/update-points/:phoneNumber', updateMembershipPointsByPhoneNumber);

export default router;
