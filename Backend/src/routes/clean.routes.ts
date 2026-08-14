import { Router } from 'express';
import * as cleanController from '../controllers/clean.controller';
import { authenticateJWT } from '../middlewares/authenticateJWT';
import { requireRole } from '../middlewares/requireRole';
import { Role } from '@prisma/client';

const router = Router();

router.delete('/', authenticateJWT, requireRole([Role.SUPER]), cleanController.clean);

export default router;
