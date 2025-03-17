import { Router } from 'express';

import { create, getRoles } from '../controllers/system';

const router = Router();
router.post('/create', create);
router.get('/retrieve', getRoles);

export default router;
