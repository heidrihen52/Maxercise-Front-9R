import { Request, Response, NextFunction } from 'express';
import * as restrictionService from '../services/restriction.service';

// Operaciones para Administradores
export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, description } = req.body;
    const authorId = req.user!.id;
    const data = await restrictionService.createRestriction(name, description, authorId);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await restrictionService.updateRestriction(id, req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    await restrictionService.deleteRestriction(id);
    res.json({ success: true, message: 'Restricción desactivada correctamente' });
  } catch (error) {
    next(error);
  }
}

// Operaciones de Auto-gestión del Usuario
export async function getMyRestrictions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await restrictionService.getUserRestrictions(req.user!.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function addMyRestriction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const restrictionId = parseInt(req.params.id, 10);
    const data = await restrictionService.addUserRestriction(req.user!.id, restrictionId);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function removeMyRestriction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const restrictionId = parseInt(req.params.id, 10);
    await restrictionService.removeUserRestriction(req.user!.id, restrictionId);
    res.json({ success: true, message: 'Restricción removida de tu perfil' });
  } catch (error) {
    next(error);
  }
}

export async function listAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await restrictionService.getAllRestrictions();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}