import { Router } from 'express';
import { createLog, getLogs } from '../controllers/LogController';
const router = Router();

router.post('', createLog);
router.get('/retrieve', getLogs);

export default router;
