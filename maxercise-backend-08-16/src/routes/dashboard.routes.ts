import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { authenticateJWT } from '../middlewares/authenticateJWT';

const router = Router();

router.get('/stats', authenticateJWT, dashboardController.getStats);

export default router;
