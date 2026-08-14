// src/controllers/routine.controller.ts
import { Request, Response, NextFunction } from 'express';
import { Body, Difficulty } from '@prisma/client';
import * as routineService from '../services/routine.service';

export async function listRoutines(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const routines = await routineService.listRoutines(req.user?.id);
    res.json({ success: true, count: routines.length, data: routines });
  } catch (error) {
    next(error);
  }
}

export async function listSafeRoutines(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const routines = await routineService.listSafeRoutines(req.user!.id);

    res.json({
      success: true,
      count: routines.length,
      data: routines,
    });
  } catch (error) {
    next(error);
  }
}

export async function createRoutine(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, description, difficulty, body_type, exercises, youtube_url, image, duration, frequency } = req.body;

    if (!title || !difficulty || !body_type) {
      res.status(400).json({ success: false, message: 'title, difficulty y body_type son obligatorios' });
      return;
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const thumbnail = files?.thumbnail?.[0];
    const content = files?.content?.[0];

    let parsedExercises: any[] | undefined;
    if (exercises) {
      try {
        parsedExercises = typeof exercises === 'string' ? JSON.parse(exercises) : exercises;
      } catch {
        res.status(400).json({ success: false, message: 'exercises debe ser un JSON válido' });
        return;
      }
    }

    const routine = await routineService.createRoutine({
      title,
      description,
      difficulty: difficulty as Difficulty,
      body_type: body_type as Body,
      authorId: req.user!.id,
      exercises: parsedExercises,
      thumbnail,
      content,
      youtubeUrl: youtube_url,
      thumbnailUrl: image,
      duration,
      frequency,
    });

    res.status(201).json({ success: true, data: routine });
  } catch (error) {
    next(error);
  }
}

export async function updateRoutine(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'ID de rutina inválido' });
      return;
    }

    const { title, description, difficulty, body_type, exercises, youtube_url, image, duration, frequency } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const thumbnail = files?.thumbnail?.[0];
    const content = files?.content?.[0];

    let parsedExercises: any[] | undefined;
    if (exercises !== undefined) {
      try {
        parsedExercises = typeof exercises === 'string' ? JSON.parse(exercises) : exercises;
      } catch {
        res.status(400).json({ success: false, message: 'exercises debe ser un JSON válido' });
        return;
      }
    }

    const data = await routineService.updateRoutine(
      id,
      {
        title,
        description,
        difficulty: difficulty as Difficulty,
        body_type: body_type as Body,
        exercises: parsedExercises,
        thumbnail,
        content,
        youtubeUrl: youtube_url,
        thumbnailUrl: image,
        duration,
        frequency,
      },
      req.user!.id
    );

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function deleteRoutine(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    await routineService.deleteRoutine(id);
    res.json({ success: true, message: 'Rutina y sus multimedias eliminadas correctamente' });
  } catch (error) {
    next(error);
  }
}

export async function toggleFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const routineId = parseInt(req.params.id, 10);
    if (isNaN(routineId)) {
      res.status(400).json({ success: false, message: 'ID de rutina inválido' });
      return;
    }

    const result = await routineService.toggleFavorite(req.user!.id, routineId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function activateRoutine(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const routineId = parseInt(req.params.id, 10);
    if (isNaN(routineId)) {
      res.status(400).json({ success: false, message: 'ID de rutina inválido' });
      return;
    }

    const result = await routineService.activateRoutine(req.user!.id, routineId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getRoutineById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await routineService.getRoutineById(id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}