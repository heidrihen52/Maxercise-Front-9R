import { Router } from 'express';
import * as seedController from '../controllers/seed.controller';
import { authenticateJWT } from '../middlewares/authenticateJWT';
import { requireRole } from '../middlewares/requireRole';
import { Role } from '@prisma/client';

const router = Router();

router.post('/', authenticateJWT, requireRole([Role.SUPER]), seedController.seed);

export default router;
