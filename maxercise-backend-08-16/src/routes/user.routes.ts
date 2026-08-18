import { Router } from 'express';
import { Role } from '@prisma/client';
import * as userController from '../controllers/user.controller';
import { authenticateJWT } from '../middlewares/authenticateJWT';
import { requireRole } from '../middlewares/requireRole';

const router = Router();

// Rutas de Perfil (Cualquier usuario autenticado)
router.get('/me', authenticateJWT, userController.getProfile);
router.put('/me', authenticateJWT, userController.updateProfile);

// Rutas de Administración de Usuarios (SUPER Admin)
router.get('/', authenticateJWT, requireRole([Role.SUPER]), userController.listUsers);
router.patch('/:id/role', authenticateJWT, requireRole([Role.SUPER]), userController.changeRole);
router.patch('/:id/status', authenticateJWT, requireRole([Role.SUPER]), userController.changeStatus);

export default router;