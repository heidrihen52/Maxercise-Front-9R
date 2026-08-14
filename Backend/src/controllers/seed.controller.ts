import { Request, Response, NextFunction } from 'express';
import * as seedService from '../services/seed.service';

export async function seed(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { count, bodyTypeDistribution, restrictionPrevalence, roomId, batchSize } = req.body;

    res.status(202).json({
      success: true,
      message: 'Seed iniciado. Escucha eventos seed_progress y metrics_update vía Socket.IO',
    });

    seedService
      .seedDatabase({ count, bodyTypeDistribution, restrictionPrevalence, roomId, batchSize })
      .catch((err) => console.error('[Seed Error]', err));
  } catch (error) {
    next(error);
  }
}
