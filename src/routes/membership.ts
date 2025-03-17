import { Router } from 'express';

import {
  createMembership,
  getAllMembership,
  getMembershipById,
  updateMembershipPointsById,
} from '../controllers/membership';

const router = Router();
router.post('/create', createMembership);
router.get('/retrieve', getAllMembership);
router.get('/retrieve/:id', getMembershipById);
router.put('/update-points/:id', updateMembershipPointsById);

export default router;
