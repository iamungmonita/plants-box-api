import { Router } from 'express';

import { createLog, getLogs } from '../controllers/log';

const router = Router();
router.post('', createLog);
router.get('/retrieve', getLogs);

export default router;
