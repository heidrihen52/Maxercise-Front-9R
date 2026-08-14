// src/services/routine.service.ts
import { Body, Difficulty } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { updateOrReplaceMedia, deleteEntityMedia } from './media.service';

export interface CreateRoutineInput {
  title: string;
  description?: string;
  difficulty: Difficulty;
  body_type: Body;
  duration?: string;
  frequency?: string;
  exercises?: Array<{
    exercise_id: number;
    reps: number;
    sets: number;
    day_number?: number;
    order?: number;
  }>;
  thumbnail?: Express.Multer.File;
  content?: Express.Multer.File;
  youtubeUrl?: string;
  thumbnailUrl?: string;
  authorId?: number;
}

export interface UpdateRoutineInput {
  title?: string;
  description?: string;
  difficulty?: Difficulty;
  body_type?: Body;
  duration?: string;
  frequency?: string;
  exercises?: Array<{
    exercise_id: number;
    reps: number;
    sets: number;
    day_number?: number;
    order?: number;
  }>;
  thumbnail?: Express.Multer.File;
  content?: Express.Multer.File;
  youtubeUrl?: string;
  thumbnailUrl?: string;
}

export async function listRoutines(userId?: number) {
  const routines = await prisma.routine.findMany({
    where: { status: true },
    include: {
      media: true,
      exercises: {
        where: { status: true },
        include: { 
          exercise: { 
            include: { 
              media: true,
              exercise_restrictions: {
                where: { status: true },
                include: { restriction: true }
              }
            } 
          } 
        },
        orderBy: [{ day_number: 'asc' }, { order: 'asc' }],
      },
      author: { select: { id: true, first_name: true, last_name: true } },
      _count: { select: { user_favorites: true } },
    },
    orderBy: { created_at: 'desc' },
  });

  if (!userId) return routines;

  const favorites = await prisma.userFavoriteRoutine.findMany({
    where: { user_id: userId },
    select: { routine_id: true },
  });
  const favoriteIds = new Set(favorites.map((f) => f.routine_id));

  return routines.map((r) => ({
    ...r,
    isFavorite: favoriteIds.has(r.id),
  }));
}

export async function listSafeRoutines(userId: number) {
  const userRestrictions = await prisma.userRestrictions.findMany({
    where: {
      user_id: userId,
      status: true,
    },
    select: {
      restriction_id: true,
    },
  });

  const restrictionIds = userRestrictions.map((r) => r.restriction_id);

  const routines = await prisma.routine.findMany({
    where: {
      status: true,
      ...(restrictionIds.length > 0 && {
        exercises: {
          none: {
            exercise: {
              exercise_restrictions: {
                some: {
                  restriction_id: { in: restrictionIds },
                  status: true,
                },
              },
            },
          },
        },
      }),
    },
    include: {
      media: true,
      exercises: {
        where: { status: true },
        include: {
          exercise: {
            include: {
              media: true,
              exercise_restrictions: {
                where: { status: true },
                include: { restriction: true }
              }
            },
          },
        },
        orderBy: [
          { day_number: 'asc' },
          { order: 'asc' },
        ],
      },
      author: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
      _count: {
        select: {
          user_favorites: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  const favorites = await prisma.userFavoriteRoutine.findMany({
    where: {
      user_id: userId,
    },
    select: {
      routine_id: true,
    },
  });

  const favoriteIds = new Set(favorites.map((f) => f.routine_id));

  return routines.map((r) => ({
    ...r,
    isFavorite: favoriteIds.has(r.id),
  }));
}

export async function getRoutineById(id: number) {
  const routine = await prisma.routine.findFirst({
    where: { id, status: true },
    include: {
      media: true,
      exercises: {
        include: {
          exercise: {
            include: { 
              media: true,
              exercise_restrictions: {
                where: { status: true },
                include: { restriction: true }
              }
            }
          }
        },
        orderBy:[{day_number: 'asc'}, {order: 'asc'}]
      }
    }
  });

  if (!routine) throw new AppError(404, 'Rutina no encontrada');
  return routine;
}

export async function createRoutine(input: CreateRoutineInput) {
  const routine = await prisma.routine.create({
    data: {
      title: input.title,
      description: input.description,
      difficulty: input.difficulty,
      body_type: input.body_type,
      duration: input.duration,
      frequency: input.frequency,
      author_id: input.authorId!,
      exercises: input.exercises?.length
        ? {
            create: input.exercises.map((ex, idx) => ({
              exercise_id: ex.exercise_id,
              reps: ex.reps,
              sets: ex.sets,
              day_number: ex.day_number ?? 1,
              order: ex.order ?? idx + 1,
              author_id: input.authorId!,
            })),
          }
        : undefined,
    },
  });

  if (input.thumbnail) {
    await updateOrReplaceMedia({
      routineId: routine.id,
      file: input.thumbnail,
      targetType: 'THUMBNAIL',
    });
  } else if (input.thumbnailUrl) {
    await prisma.media.create({
      data: {
        url: input.thumbnailUrl,
        type: 'THUMBNAIL',
        routine_id: routine.id,
      },
    });
  }

  if (input.content || input.youtubeUrl) {
    await updateOrReplaceMedia({
      routineId: routine.id,
      file: input.content,
      youtubeUrl: input.youtubeUrl,
      targetType: 'CONTENT',
    });
  }

  return getRoutineById(routine.id);
}

export async function updateRoutine(id: number, input: UpdateRoutineInput, authorId?: number) {
  const existing = await prisma.routine.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Rutina no encontrada');

  await prisma.routine.update({
    where: { id },
    data: {
      ...(input.title && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.difficulty && { difficulty: input.difficulty }),
      ...(input.body_type && { body_type: input.body_type }),
      ...(input.duration !== undefined && { duration: input.duration }),
      ...(input.frequency !== undefined && { frequency: input.frequency }),
    },
  });
  
  await prisma.$transaction(async (tx) => {
    if (input.exercises) {
      await tx.routineExercise.deleteMany({ where: { routine_id: id } });
      if (input.exercises.length > 0) {
        await tx.routineExercise.createMany({
          data: input.exercises.map((ex, idx) => ({
            routine_id: id,
            exercise_id: ex.exercise_id,
            reps: ex.reps,
            sets: ex.sets,
            day_number: ex.day_number ?? 1,
            order: ex.order ?? idx + 1,
            author_id: authorId ?? existing.author_id,
          })),
        });
      }
    }
  })

  if (input.thumbnail) {
    await updateOrReplaceMedia({
      routineId: id,
      file: input.thumbnail,
      targetType: 'THUMBNAIL',
    });
  } else if (input.thumbnailUrl !== undefined) {
    const existingMedia = await prisma.media.findFirst({
      where: {
        routine_id: id,
        type: 'THUMBNAIL',
      },
    });

    if (input.thumbnailUrl === '') {
      if (existingMedia) {
        await prisma.media.delete({ where: { id: existingMedia.id } });
      }
    } else {
      if (existingMedia) {
        await prisma.media.update({
          where: { id: existingMedia.id },
          data: { url: input.thumbnailUrl },
        });
      } else {
        await prisma.media.create({
          data: {
            url: input.thumbnailUrl,
            type: 'THUMBNAIL',
            routine_id: id,
          },
        });
      }
    }
  }

  if (input.content || input.youtubeUrl) {
    await updateOrReplaceMedia({
      routineId: id,
      file: input.content,
      youtubeUrl: input.youtubeUrl,
      targetType: 'CONTENT',
    });
  }

  return getRoutineById(id);
}

export async function deleteRoutine(id: number) {
  const existing = await prisma.routine.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Rutina no encontrada');

  // Eliminar multimedia en Supabase
  await deleteEntityMedia(undefined, id);

  // Borrar de MySQL (Cascade borra los registros de Media)
  return prisma.routine.delete({
    where: { id },
  });
}

export async function toggleFavorite(userId: number, routineId: number) {
  const routine = await prisma.routine.findUnique({ where: { id: routineId } });
  if (!routine || !routine.status) {
    throw new AppError(404, 'Rutina no encontrada');
  }

  const existing = await prisma.userFavoriteRoutine.findUnique({
    where: { user_id_routine_id: { user_id: userId, routine_id: routineId } },
  });

  if (existing) {
    await prisma.userFavoriteRoutine.delete({ where: { id: existing.id } });
    return { routineId, isFavorite: false };
  }

  await prisma.userFavoriteRoutine.create({
    data: { user_id: userId, routine_id: routineId },
  });

  return { routineId, isFavorite: true };
}

export async function activateRoutine(userId: number, routineId: number) {
  const routine = await prisma.routine.findUnique({ where: { id: routineId } });
  if (!routine || !routine.status) {
    throw new AppError(404, 'Rutina no encontrada');
  }

  return prisma.userActiveRoutine.upsert({
    where: { user_id: userId },
    update: {
      routine_id: routineId,
      start_date: new Date(),
      last_completed_day: 0,
    },
    create: {
      user_id: userId,
      routine_id: routineId,
      start_date: new Date(),
      last_completed_day: 0,
    },
    include: { routine: true },
  });
}