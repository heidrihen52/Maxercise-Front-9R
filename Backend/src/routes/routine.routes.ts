// src/routes/routine.routes.ts
import { Router } from 'express';
import multer from 'multer';
import * as routineController from '../controllers/routine.controller';
import { authenticateJWT } from '../middlewares/authenticateJWT';
import { requireRole } from '../middlewares/requireRole';
import { Role } from '@prisma/client';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de archivo no permitido'));
    }
  },
});

const mediaUpload = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'content', maxCount: 1 },
]);

const router = Router();

router.get('/', authenticateJWT, routineController.listRoutines);
router.get('/safe', authenticateJWT, routineController.listSafeRoutines);
router.get('/:id', authenticateJWT, routineController.getRoutineById);

router.post('/:id/favorite', authenticateJWT, routineController.toggleFavorite);
router.post('/:id/activate', authenticateJWT, routineController.activateRoutine);

router.post('/', authenticateJWT, requireRole([Role.SUPER]), mediaUpload, routineController.createRoutine);
router.put('/:id', authenticateJWT, requireRole([Role.SUPER]), mediaUpload, routineController.updateRoutine);
router.delete('/:id', authenticateJWT, requireRole([Role.SUPER]), routineController.deleteRoutine);

export default router;