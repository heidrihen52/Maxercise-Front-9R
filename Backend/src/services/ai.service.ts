import axios from 'axios';
import { env } from '../config/env';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';

const aiClient = axios.create({
  baseURL: env.aiServiceUrl,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// 1. Predicción de Churn (Usando workout_logs)
export async function proxyUserChurn() {
  const users = await prisma.user.findMany({
    where: { status: true },
    select: {
      id: true,
      updated_at: true,
      workout_logs: {
        orderBy: { completed_at: 'desc' },
        take: 10,
      },
    },
  });

  const now = new Date();
  const payload = {
    users: users.map((u) => {
      const lastActive = u.updated_at ? new Date(u.updated_at) : now;
      const daysInactive = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 3600 * 24));
      const completedCount = u.workout_logs.length;

      return {
        user_id: u.id,
        days_inactive: daysInactive,
        frequency_drop_ratio: daysInactive > 14 ? 0.7 : 0.1,
        goal_completion_rate: completedCount >= 5 ? 1.0 : completedCount / 5,
      };
    }),
  };

  try {
    const { data } = await aiClient.post('/ai/churn-prediction', payload);
    return data;
  } catch {
    throw new AppError(502, 'Error al conectar con el microservicio de IA (Churn)');
  }
}

// 2. Detección de Sobreesfuerzo (Usando workoutLog)
export async function proxyOverexertion(userId: number, body: { proposed_volume: number; proposed_hr: number }) {
  const recentWorkouts = await prisma.workoutLog.findMany({
    where: { user_id: userId },
    orderBy: { completed_at: 'desc' },
    take: 15,
  });

  const avgHr = recentWorkouts.length
    ? recentWorkouts.reduce((acc, curr) => acc + (curr.avg_heart_rate || 0), 0) / recentWorkouts.length
    : body.proposed_hr;

  const lastWorkout = recentWorkouts[0];
  const daysSinceLast = lastWorkout
    ? Math.floor((new Date().getTime() - new Date(lastWorkout.completed_at).getTime()) / (1000 * 3600 * 24))
    : 1;

  const payload = {
    user_id: userId,
    proposed_volume: body.proposed_volume,
    proposed_hr: body.proposed_hr,
    historical_avg_volume: 1000,
    historical_avg_hr: avgHr || body.proposed_hr,
    days_since_last_session: daysSinceLast,
  };

  try {
    const { data } = await aiClient.post('/ai/overexertion-check', payload);
    return data;
  } catch {
    throw new AppError(502, 'Error al conectar con el microservicio de IA (Sobreesfuerzo)');
  }
}

// 3. Anomalías Biométricas (Usando workoutLog)
export async function proxyBiometricAnomalies() {
  const readings = await prisma.workoutLog.findMany({
    orderBy: { completed_at: 'desc' },
    take: 100,
  });

  const payload = {
    readings: readings.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      heart_rate: r.avg_heart_rate ?? 70,
      calories: r.calories ?? 0,
      duration_minutes: r.duration_sec ? Math.round(r.duration_sec / 60) : 30,
    })),
  };

  try {
    const { data } = await aiClient.post('/ai/biometric-anomalies', payload);
    return data;
  } catch {
    throw new AppError(502, 'Error al conectar con el microservicio de IA (Anomalías Biométricas)');
  }
}

// 4. Reglas de Asociación para Rutinas
export async function proxyAssociationRules() {
  const routines = await prisma.routine.findMany({
    where: { status: true },
    include: {
      exercises: { select: { exercise_id: true } },
    },
  });

  const payload = {
    routines_exercises: routines.map((r) => ({
      routine_id: r.id,
      exercise_ids: r.exercises.map((e) => e.exercise_id),
    })),
    min_support: 0.05,
    min_confidence: 0.3,
  };

  try {
    const { data } = await aiClient.post('/ai/routine-association-rules', payload);
    return data;
  } catch {
    throw new AppError(502, 'Error al conectar con el microservicio de IA (Reglas de Asociación)');
  }
}