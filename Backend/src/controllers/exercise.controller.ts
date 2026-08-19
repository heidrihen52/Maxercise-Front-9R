// src/controllers/exercise.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as exerciseService from '../services/exercise.service';

export async function listExercises(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const exercises = await exerciseService.getExercisesForUser(userId);
    res.json({ success: true, count: exercises.length, data: exercises });
  } catch (error) {
    next(error);
  }
}

export async function createExercise(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, description, instructions, muscleIds, restrictions, youtube_url } = req.body;

    if (!title || !description || !instructions) {
      res.status(400).json({ success: false, message: 'title, description e instructions son obligatorios' });
      return;
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const thumbnail = files?.thumbnail?.[0];
    const content = files?.content?.[0];

    let parsedMuscleIds: number[] = [];
    let parsedRestrictions: number[] = [];

    try {
      parsedMuscleIds = muscleIds ? JSON.parse(muscleIds) : [];
      parsedRestrictions = restrictions ? JSON.parse(restrictions) : [];
    } catch {
      res.status(400).json({ success: false, message: 'muscleIds y restrictions deben ser JSON válido' });
      return;
    }

    const exercise = await exerciseService.createExercise({
      title,
      description,
      instructions,
      authorId: req.user!.id,
      muscleIds: parsedMuscleIds,
      restrictions: parsedRestrictions,
      thumbnail,
      content,
      youtubeUrl: youtube_url,
    });

    res.status(201).json({ success: true, data: exercise });
  } catch (error) {
    next(error);
  }
}

export async function updateExercise(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'ID de ejercicio inválido' });
      return;
    }

    const { title, description, instructions, muscleIds, restrictions, youtube_url } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const thumbnail = files?.thumbnail?.[0];
    const content = files?.content?.[0];

    let parsedMuscleIds: number[] | undefined;
    let parsedRestrictions: number[] | undefined;

    try {
      if (muscleIds !== undefined) parsedMuscleIds = JSON.parse(muscleIds);
      if (restrictions !== undefined) parsedRestrictions = JSON.parse(restrictions);
    } catch {
      res.status(400).json({ success: false, message: 'muscleIds y restrictions deben ser JSON válido' });
      return;
    }

    const exercise = await exerciseService.updateExercise(
      id,
      {
        title,
        description,
        instructions,
        muscleIds: parsedMuscleIds,
        restrictions: parsedRestrictions,
        thumbnail,
        content,
        youtubeUrl: youtube_url,
      },
      req.user!.id
    );

    res.json({ success: true, data: exercise });
  } catch (error) {
    next(error);
  }
}

export async function toggleFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const exerciseId = parseInt(req.params.id, 10);
    if (isNaN(exerciseId)) {
      res.status(400).json({ success: false, message: 'ID de ejercicio inválido' });
      return;
    }

    const result = await exerciseService.toggleFavorite(req.user!.id, exerciseId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getExerciseById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await exerciseService.getExerciseById(id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function listExercisesAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await exerciseService.getAllExercisesAdmin(page, limit);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function deleteExercise(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    await exerciseService.deleteExercise(id);
    res.json({ success: true, message: 'Ejercicio y multimedias eliminados correctamente' });
  } catch (error) {
    next(error);
  }
}