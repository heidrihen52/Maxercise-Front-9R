import { Request, Response, NextFunction } from 'express';
import * as muscleService from '../services/muscle.service';

export async function listMuscles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await muscleService.listMusclesAndGroups();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function createMuscleGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, description } = req.body;
    const authorId = req.user!.id;
    const data = await muscleService.createMuscleGroup({ name, description, authorId });
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function createMuscle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, description, muscleGroupId } = req.body;
    const authorId = req.user!.id;
    const data = await muscleService.createMuscle({ name, description, muscleGroupId, authorId });
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function updateMuscleGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id);

    const data = await muscleService.updateMuscleGroup(id, req.body);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMuscle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id);

    const data = await muscleService.updateMuscle(id, req.body);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteMuscleGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id);

    await muscleService.deleteMuscleGroup(id);

    res.json({
      success: true,
      message: 'Grupo muscular eliminado correctamente',
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteMuscle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id);

    await muscleService.deleteMuscle(id);

    res.json({
      success: true,
      message: 'Músculo eliminado correctamente',
    });
  } catch (error) {
    next(error);
  }
}