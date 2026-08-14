import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';
import { authenticateJWT } from '../middlewares/authenticateJWT';

const router = Router();

// Supervisados
router.get('/churn-prediction', authenticateJWT, aiController.getUserChurn);
router.post('/overexertion-check/:userId', authenticateJWT, aiController.checkOverexertion);

// No supervisados
router.get('/biometric-anomalies', authenticateJWT, aiController.getBiometricAnomalies);
router.get('/association-rules', authenticateJWT, aiController.getRoutineAssociationRules);

export default router;
