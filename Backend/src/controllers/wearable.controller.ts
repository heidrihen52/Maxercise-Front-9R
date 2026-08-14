import { Request, Response, NextFunction } from 'express';
import * as wearableService from '../services/wearable.service';

export async function sync(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payload = await wearableService.getWearableSyncPayload(req.user!.id);
    res.json({ success: true, data: payload });
  } catch (error) {
    next(error);
  }
}

export async function completeDay(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { dayNumber } = req.body;

    if (typeof dayNumber !== 'number' || dayNumber < 1) {
      res.status(400).json({ success: false, message: 'dayNumber debe ser un entero positivo' });
      return;
    }

    const result = await wearableService.completeWearableDay(req.user!.id, dayNumber);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function feedback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { perceivedEffort, durationMinutes, caloriesBurned, heartRateAvg, notes } = req.body;

    if (typeof perceivedEffort !== 'number' || perceivedEffort < 1 || perceivedEffort > 10) {
      res.status(400).json({
        success: false,
        message: 'perceivedEffort es obligatorio y debe estar entre 1 y 10',
      });
      return;
    }

    const result = await wearableService.submitWorkoutFeedback(req.user!.id, {
      perceivedEffort,
      durationMinutes,
      caloriesBurned,
      heartRateAvg,
      notes,
    });

    res.status(202).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
