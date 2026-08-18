import { Router } from 'express';
import * as wearableController from '../controllers/wearable.controller';
import { authenticateJWT } from '../middlewares/authenticateJWT';

const router = Router();

router.get('/sync', authenticateJWT, wearableController.sync);
router.post('/complete-day', authenticateJWT, wearableController.completeDay);

export default router;
