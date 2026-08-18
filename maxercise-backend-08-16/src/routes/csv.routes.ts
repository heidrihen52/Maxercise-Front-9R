import { Router } from 'express';
import multer from 'multer';
import * as csvController from '../controllers/csv.controller';
import { authenticateJWT } from '../middlewares/authenticateJWT';
import { requireRole } from '../middlewares/requireRole';
import { Role } from '@prisma/client';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos .csv'));
    }
  },
});

const router = Router();

router.get('/export-csv', authenticateJWT, requireRole([Role.SUPER]), csvController.exportCsv);
router.post(
  '/import-csv',
  authenticateJWT,
  requireRole([Role.SUPER]),
  upload.single('file'),
  csvController.importCsv
);

export default router;
