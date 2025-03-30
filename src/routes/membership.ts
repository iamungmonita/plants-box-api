import { Router } from 'express';
const router = Router();

import {
  createMembership,
  getAllMembership,
  getMembershipById,
  updateMembershipById,
  updateMembershipPointsByPhoneNumber,
} from '../controllers/MembershipController';

router.post('/create', createMembership);
router.get('/retrieve', getAllMembership);
router.get('/retrieve/:id', getMembershipById);
router.put('/update-points/:phoneNumber', updateMembershipPointsByPhoneNumber);
router.put('/update/:id', updateMembershipById);

export default router;
