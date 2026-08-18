import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';

export async function getWearableSyncPayload(userId: number) {
  const [activeRoutine, favoriteRoutines, favoriteExercises, restrictions] = await Promise.all([
    prisma.userActiveRoutine.findUnique({
      where: { user_id: userId },
      include: {
        routine: {
          include: {
            exercises: {
              where: { status: true },
              include: {
                exercise: {
                  include: {
                    media: { where: { type: 'THUMBNAIL' }, take: 1 },
                  },
                },
              },
              orderBy: [{ day_number: 'asc' }, { order: 'asc' }],
            },
          },
        },
      },
    }),
    prisma.userFavoriteRoutine.findMany({
      where: { user_id: userId },
      include: {
        routine: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            body_type: true,
          },
        },
      },
    }),
    prisma.userFavoriteExercise.findMany({
      where: { user_id: userId },
      include: {
        exercise: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    }),
    prisma.userRestrictions.findMany({
      where: { user_id: userId, status: true },
      include: { restriction: { select: { id: true, name: true } } },
    }),
  ]);

  const daysMap = new Map<number, Array<Record<string, unknown>>>();

  if (activeRoutine?.routine.exercises) {
    for (const re of activeRoutine.routine.exercises) {
      const day = re.day_number;
      if (!daysMap.has(day)) {
        daysMap.set(day, []);
      }
      daysMap.get(day)!.push({
        order: re.order,
        reps: re.reps,
        sets: re.sets,
        exercise: {
          id: re.exercise.id,
          title: re.exercise.title,
          thumbnail: re.exercise.media[0]?.url ?? null,
        },
      });
    }
  }

  const days = Array.from(daysMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([dayNumber, exercises]) => ({ dayNumber, exercises }));

  return {
    syncedAt: new Date().toISOString(),
    activeRoutine: activeRoutine
      ? {
          id: activeRoutine.routine.id,
          title: activeRoutine.routine.title,
          difficulty: activeRoutine.routine.difficulty,
          bodyType: activeRoutine.routine.body_type,
          startDate: activeRoutine.start_date,
          lastCompletedDay: activeRoutine.last_completed_day,
          days,
        }
      : null,
    favorites: favoriteRoutines.map((f) => ({
      id: f.routine.id,
      title: f.routine.title,
      difficulty: f.routine.difficulty,
      bodyType: f.routine.body_type,
    })),
    favoriteExercises: favoriteExercises.map((f) => ({
      id: f.exercise.id,
      title: f.exercise.title,
    })),
    restrictions: restrictions.map((r) => ({
      id: r.restriction.id,
      name: r.restriction.name,
    })),
  };
}

export async function completeWearableDay(userId: number, dayNumber: number) {
  const active = await prisma.userActiveRoutine.findUnique({ where: { user_id: userId } });

  if (!active) {
    throw new AppError(404, 'No tienes una rutina activa');
  }

  if (dayNumber <= active.last_completed_day) {
    throw new AppError(400, 'Este día ya fue completado o el número es inválido');
  }

  return prisma.userActiveRoutine.update({
    where: { user_id: userId },
    data: { last_completed_day: dayNumber },
  });
}

export interface WorkoutFeedback {
  perceivedEffort: number;
  durationMinutes?: number;
  caloriesBurned?: number;
  heartRateAvg?: number;
  notes?: string;
}

export async function submitWorkoutFeedback(userId: number, feedback: WorkoutFeedback) {
  const active = await prisma.userActiveRoutine.findUnique({
    where: { user_id: userId },
    include: { routine: true },
  });

  if (!active) {
    throw new AppError(404, 'No tienes una rutina activa');
  }

  const durationSec = feedback.durationMinutes ? feedback.durationMinutes * 60 : null;

  const log = await prisma.workoutLog.create({
    data: {
      user_id: userId,
      routine_id: active.routine_id,
      day_number: active.last_completed_day || 1,
      started_at: new Date(Date.now() - (durationSec ?? 1800) * 1000),
      completed_at: new Date(),
      duration_sec: durationSec,
      calories: feedback.caloriesBurned,
      avg_heart_rate: feedback.heartRateAvg,
    },
  });

  return {
    logId: log.id,
    userId,
    routineId: active.routine_id,
    receivedAt: log.completed_at,
    feedback,
    status: 'saved_and_queued_for_ai',
  };
}