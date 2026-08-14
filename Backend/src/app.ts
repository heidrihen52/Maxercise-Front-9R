import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { generalRateLimiter } from './middlewares/rateLimiter';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes'
import muscleRoutes from './routes/muscle.routes'
import exerciseRoutes from './routes/exercise.routes';
import restrictionRoutes from './routes/restriction.routes';
import routineRoutes from './routes/routine.routes';
import dashboardRoutes from './routes/dashboard.routes';
import aiRoutes from './routes/ai.routes';
import wearableRoutes from './routes/wearable.routes';
import seedRoutes from './routes/seed.routes';
import csvRoutes from './routes/csv.routes';
import cleanRoutes from './routes/clean.routes';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin === '*' ? true : env.corsOrigin,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(generalRateLimiter);

  app.get('/health', (_req, res) => {
    res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users',userRoutes)
  app.use('/api/muscles',muscleRoutes)
  app.use('/api/exercises', exerciseRoutes);
  app.use('/api/restrictions', restrictionRoutes);
  app.use('/api/routines', routineRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/wearable', wearableRoutes);
  app.use('/api/seed', seedRoutes);
  app.use('/api', csvRoutes);
  app.use('/api/clean', cleanRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
