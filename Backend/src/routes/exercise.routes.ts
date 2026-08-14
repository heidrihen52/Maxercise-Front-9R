// src/routes/exercise.routes.ts
import { Router } from 'express';
import multer from 'multer';
import * as exerciseController from '../controllers/exercise.controller';
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

router.get('/', authenticateJWT, exerciseController.listExercises);
router.get('/admin', authenticateJWT, requireRole([Role.SUPER]), exerciseController.listExercisesAdmin);
router.post('/:id/favorite', authenticateJWT, exerciseController.toggleFavorite);

router.post('/', authenticateJWT, requireRole([Role.SUPER]), mediaUpload, exerciseController.createExercise);
router.put('/:id', authenticateJWT, requireRole([Role.SUPER]), mediaUpload, exerciseController.updateExercise);
router.delete('/:id', authenticateJWT, requireRole([Role.SUPER]), exerciseController.deleteExercise);

router.get('/:id', authenticateJWT, exerciseController.getExerciseById);

export default router;