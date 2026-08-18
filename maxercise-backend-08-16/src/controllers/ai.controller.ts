import { Request, Response, NextFunction } from 'express';
import * as aiService from '../services/ai.service';

export async function getUserChurn(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await aiService.proxyUserChurn();
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function checkOverexertion(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = Number(req.params.userId || req.user?.id);
    const { proposed_volume, proposed_hr } = req.body;
    
    const result = await aiService.proxyOverexertion(userId, {
      proposed_volume: Number(proposed_volume) || 1000,
      proposed_hr: Number(proposed_hr) || 140,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getBiometricAnomalies(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await aiService.proxyBiometricAnomalies();
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getRoutineAssociationRules(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await aiService.proxyAssociationRules();
    res.json(result);
  } catch (error) {
    next(error);
  }
}