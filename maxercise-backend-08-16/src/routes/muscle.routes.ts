import { Router } from 'express';
import { Role } from '@prisma/client';
import * as muscleController from '../controllers/muscle.controller';
import { authenticateJWT } from '../middlewares/authenticateJWT';
import { requireRole } from '../middlewares/requireRole';

const router = Router();

router.get('/', authenticateJWT, muscleController.listMuscles);

router.post('/groups', authenticateJWT, requireRole([Role.SUPER]), muscleController.createMuscleGroup);

router.put('/groups/:id',authenticateJWT,requireRole([Role.SUPER]),muscleController.updateMuscleGroup);

router.delete('/groups/:id',authenticateJWT,requireRole([Role.SUPER]),muscleController.deleteMuscleGroup);

router.post('/',authenticateJWT,requireRole([Role.SUPER]),muscleController.createMuscle);

router.put('/:id',authenticateJWT,requireRole([Role.SUPER]),muscleController.updateMuscle);

router.delete('/:id',authenticateJWT,requireRole([Role.SUPER]),muscleController.deleteMuscle);

export default router;