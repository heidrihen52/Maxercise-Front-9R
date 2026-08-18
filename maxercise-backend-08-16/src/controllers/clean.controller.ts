import { Request, Response, NextFunction } from 'express';
import * as cleanService from '../services/clean.service';

export async function clean(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await cleanService.cleanDatabase();
    res.json(result);
  } catch (error) {
    next(error);
  }
}
