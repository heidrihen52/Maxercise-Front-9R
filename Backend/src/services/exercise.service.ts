// src/services/exercise.service.ts
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { updateOrReplaceMedia, deleteEntityMedia } from './media.service';

export interface CreateExerciseInput {
  title: string;
  description: string;
  instructions: string;
  authorId: number;
  muscleIds: number[];
  restrictions: number[];
  thumbnail?: Express.Multer.File;
  content?: Express.Multer.File;
  youtubeUrl?: string;
  thumbnailUrl?: string;
}

export interface UpdateExerciseInput {
  title?: string;
  description?: string;
  instructions?: string;
  muscleIds?: number[];
  restrictions?: number[];
  thumbnail?: Express.Multer.File;
  content?: Express.Multer.File;
  youtubeUrl?: string;
  thumbnailUrl?: string;
}

export async function getExerciseById(id: number) {
  const exercise = await prisma.exercise.findFirst({
    where: { id, status: true },
    include: {
      media: true,
      exercise_muscles: { include: { muscle: true } },
      exercise_restrictions: { include: { restriction: true } },
    },
  });
  if (!exercise) throw new AppError(404, 'Ejercicio no encontrado');
  return exercise;
}

export async function getAllExercisesAdmin(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const [total, exercises] = await Promise.all([
    prisma.exercise.count(),
    prisma.exercise.findMany({
      skip,
      take: limit,
      include: {
        media: true,
        exercise_muscles: { include: { muscle: true } },
        exercise_restrictions: { include: { restriction: true } },
      },
      orderBy: { id: 'desc' },
    }),
  ]);
  return { total, page, limit, totalPages: Math.ceil(total / limit), data: exercises };
}

export async function getExercisesForUser(userId: number) {
  const userRestrictions = await prisma.userRestrictions.findMany({
    where: { user_id: userId, status: true },
    select: { restriction_id: true },
  });

  const restrictedIds = userRestrictions.map((r) => r.restriction_id);

  const blockedExerciseIds =
    restrictedIds.length > 0
      ? await prisma.exerciseRestrictions.findMany({
          where: {
            restriction_id: { in: restrictedIds },
            status: true,
          },
          select: { exercise_id: true },
        })
      : [];

  const excludedIds = [...new Set(blockedExerciseIds.map((e) => e.exercise_id))];

  return prisma.exercise.findMany({
    where: {
      status: true,
      ...(excludedIds.length > 0 ? { id: { notIn: excludedIds } } : {}),
    },
    include: {
      media: true,
      exercise_muscles: { include: { muscle: true } },
      exercise_restrictions: {
        where: { status: true },
        include: { restriction: true },
      },
    },
    orderBy: { title: 'asc' },
  });
}

// 1. CREACIÓN
export async function createExercise(input: CreateExerciseInput) {
  const exercise = await prisma.exercise.create({
    data: {
      title: input.title,
      description: input.description,
      instructions: input.instructions,
      author_id: input.authorId,
      exercise_muscles: {
        create: input.muscleIds.map((muscle_id) => ({
          muscle_id,
          author_id: input.authorId,
        })),
      },
      exercise_restrictions: {
        create: input.restrictions.map((restriction_id) => ({
          restriction_id,
          author_id: input.authorId,
        })),
      },
    },
  });

  if (input.thumbnail) {
    await updateOrReplaceMedia({
      exerciseId: exercise.id,
      file: input.thumbnail,
      targetType: 'THUMBNAIL',
    });
  } else if (input.thumbnailUrl) {
    await prisma.media.create({
      data: {
        url: input.thumbnailUrl,
        type: 'THUMBNAIL',
        exercise_id: exercise.id,
      },
    });
  }

  if (input.content || input.youtubeUrl) {
    await updateOrReplaceMedia({
      exerciseId: exercise.id,
      file: input.content,
      youtubeUrl: input.youtubeUrl,
      targetType: 'CONTENT',
    });
  }

  return getExerciseById(exercise.id);
}

// 2. EDICIÓN (REEMPLAZA MULTIMEDIA SI SE ENVÍA UNA NUEVA)
export async function updateExercise(id: number, input: UpdateExerciseInput, authorId: number) {
  const existing = await prisma.exercise.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Ejercicio no encontrado');

  await prisma.exercise.update({
    where: { id },
    data: {
      ...(input.title && { title: input.title }),
      ...(input.description && { description: input.description }),
      ...(input.instructions && { instructions: input.instructions }),
    },
  });

  await prisma.$transaction(async (tx)=>{
    if (input.muscleIds) {
      await tx.exerciseMuscles.deleteMany({ where: { exercise_id: id } });
      if (input.muscleIds.length > 0) {
        await tx.exerciseMuscles.createMany({
          data: input.muscleIds.map((muscle_id) => ({
            exercise_id: id,
            muscle_id,
            author_id: authorId,
          })),
        });
      }
    }

    if (input.restrictions) {
      await tx.exerciseRestrictions.deleteMany({ where: { exercise_id: id } });
      if (input.restrictions.length > 0) {
        await tx.exerciseRestrictions.createMany({
          data: input.restrictions.map((restriction_id) => ({
            exercise_id: id,
            restriction_id,
            author_id: authorId,
          })),
        });
      }
    }
  })

  if (input.thumbnail) {
    await updateOrReplaceMedia({
      exerciseId: id,
      file: input.thumbnail,
      targetType: 'THUMBNAIL',
    });
  } else if (input.thumbnailUrl !== undefined) {
    const existingMedia = await prisma.media.findFirst({
      where: {
        exercise_id: id,
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
            exercise_id: id,
          },
        });
      }
    }
  }

  if (input.content || input.youtubeUrl) {
    await updateOrReplaceMedia({
      exerciseId: id,
      file: input.content,
      youtubeUrl: input.youtubeUrl,
      targetType: 'CONTENT',
    });
  }

  return getExerciseById(id);
}

// 3. ELIMINACIÓN DE FISICA Y MULTIMEDIA EN SUPABASE
export async function deleteExercise(id: number) {
  const existing = await prisma.exercise.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Ejercicio no encontrado');

  // Eliminar archivos físicos de Supabase
  await deleteEntityMedia(id, undefined);

  // Eliminar de MySQL (los registros en la tabla Media se eliminan en cascada)
  return prisma.exercise.delete({
    where: { id },
  });
}

export async function toggleFavorite(userId: number, exerciseId: number) {
  const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } });
  if (!exercise || !exercise.status) {
    throw new AppError(404, 'Ejercicio no encontrado');
  }

  const existing = await prisma.userFavoriteExercise.findUnique({
    where: { user_id_exercise_id: { user_id: userId, exercise_id: exerciseId } },
  });

  if (existing) {
    await prisma.userFavoriteExercise.delete({ where: { id: existing.id } });
    return { exerciseId, isFavorite: false };
  }

  await prisma.userFavoriteExercise.create({
    data: { user_id: userId, exercise_id: exerciseId },
  });

  return { exerciseId, isFavorite: true };
}