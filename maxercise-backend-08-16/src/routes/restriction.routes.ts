import { Router } from 'express';
import { Role } from '@prisma/client';
import * as restrictionController from '../controllers/restriction.controller';
import { authenticateJWT } from '../middlewares/authenticateJWT';
import { requireRole } from '../middlewares/requireRole';

const router = Router();

// Obtener catálogo completo de restricciones
router.get('/', authenticateJWT, restrictionController.listAll);

// Auto-gestión del usuario logueado
router.get('/me', authenticateJWT, restrictionController.getMyRestrictions);
router.post('/me/:id', authenticateJWT, restrictionController.addMyRestriction);
router.delete('/me/:id', authenticateJWT, restrictionController.removeMyRestriction);

// Gestión Global de Restricciones (Administradores)
router.post('/', authenticateJWT, requireRole([Role.SUPER]), restrictionController.create);
router.put('/:id', authenticateJWT, requireRole([Role.SUPER]), restrictionController.update);
router.delete('/:id', authenticateJWT, requireRole([Role.SUPER]), restrictionController.remove);

export default router;