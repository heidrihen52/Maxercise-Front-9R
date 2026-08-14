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
  } catch (err) {
    console.warn('[AI Service] Microservicio de Churn no disponible. Ejecutando clasificador local.');
    const predictions = payload.users.map((u) => {
      const churnProb = Math.min(1.0, Math.max(0.0, (u.days_inactive / 30) * 0.5 + u.frequency_drop_ratio * 0.3 + (1.0 - u.goal_completion_rate) * 0.2));
      let riskLevel = 'Bajo';
      let primaryReason = 'Entrenamientos constantes y adherencia estable.';
      
      if (churnProb >= 0.7) {
        riskLevel = 'Alto';
        primaryReason = u.days_inactive > 14 
          ? `Inactividad crítica (${u.days_inactive} días sin registrar actividad).`
          : 'Frecuencia de entrenamiento reducida drásticamente.';
      } else if (churnProb >= 0.35) {
        riskLevel = 'Medio';
        primaryReason = 'Disminución en el cumplimiento de objetivos semanales.';
      }

      return {
        user_id: u.user_id,
        churn_probability: Math.round(churnProb * 100) / 100,
        risk_level: riskLevel,
        primary_reason: primaryReason,
      };
    });

    return { success: true, fallback: true, predictions };
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
  } catch (err) {
    console.warn('[AI Service] Microservicio de Sobreesfuerzo no disponible. Ejecutando clasificador local.');
    const volRatio = payload.proposed_volume / payload.historical_avg_volume;
    const hrRatio = payload.proposed_hr / payload.historical_avg_hr;
    
    let score = (volRatio - 1.0) * 0.4 + (hrRatio - 1.0) * 0.4;
    if (payload.days_since_last_session <= 1) {
      score += 0.2; // Penalización por falta de descanso diario
    }

    let riskLevel = 'Bajo';
    let reason = 'El volumen e intensidad proyectados se adaptan perfectamente a tu historial.';
    const recommendations = [];

    if (score >= 0.65 || volRatio > 1.6) {
      riskLevel = 'Alto';
      reason = 'Incremento crítico en el volumen de entrenamiento sin descanso adecuado.';
      recommendations.push(
        'Reducir el volumen de la sesión propuesta en un 20%.',
        'Aumentar los descansos entre series a 2 minutos.',
        'Extender el descanso activo y posponer ejercicios accesorios de alta intensidad.'
      );
    } else if (score >= 0.3 || volRatio > 1.3 || hrRatio > 1.2) {
      riskLevel = 'Moderado';
      reason = 'Intensidad superior a la media habitual del usuario.';
      recommendations.push(
        'Reducir el volumen propuesto en un 10%.',
        'Mantener hidratación óptima y descansos de al menos 90 segundos entre series.'
      );
    } else {
      recommendations.push(
        'Proceder con el entrenamiento planificado.',
        'Monitorear sensaciones de fatiga en articulaciones.'
      );
    }

    return {
      success: true,
      fallback: true,
      risk_level: riskLevel,
      reason,
      recommendations
    };
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
  } catch (err) {
    console.warn('[AI Service] Microservicio de Anomalías Biométricas no disponible. Ejecutando clasificador local.');
    const anomalies = payload.readings.map((r) => {
      let isAnomaly = false;
      let reason = 'Lectura biométrica estándar y consistente.';
      let score = 0.15;

      const caloriesPerMin = r.duration_minutes > 0 ? r.calories / r.duration_minutes : 0;

      if (r.heart_rate > 215) {
        isAnomaly = true;
        reason = `Frecuencia cardíaca promedio críticamente alta (${r.heart_rate} BPM).`;
        score = 0.85;
      } else if (r.heart_rate < 40 && r.heart_rate > 0) {
        isAnomaly = true;
        reason = `Frecuencia cardíaca sospechosamente baja (${r.heart_rate} BPM).`;
        score = 0.78;
      } else if (caloriesPerMin > 25) {
        isAnomaly = true;
        reason = `Gasto calórico desproporcionado (${r.calories} kcal en ${r.duration_minutes} min).`;
        score = 0.90;
      } else if (r.heart_rate > 140 && r.calories < 10 && r.duration_minutes > 10) {
        isAnomaly = true;
        reason = 'Posible falla del sensor: Frecuencia cardíaca alta pero sin registro de gasto calórico.';
        score = 0.72;
      }

      return {
        id: r.id,
        user_id: r.user_id,
        heart_rate: r.heart_rate,
        calories: r.calories,
        duration_minutes: r.duration_minutes,
        anomaly_score: score,
        is_anomaly: isAnomaly,
        reason,
      };
    });

    return {
      success: true,
      fallback: true,
      anomalies: anomalies.filter((a) => a.is_anomaly),
    };
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
  } catch (err) {
    console.warn('[AI Service] Microservicio de Reglas de Asociación no disponible. Ejecutando algoritmo local.');
    const exerciseCounts: Record<number, number> = {};
    const pairCounts: Record<string, number> = {};
    const totalRoutines = payload.routines_exercises.length;

    payload.routines_exercises.forEach((rt) => {
      const ids = [...new Set(rt.exercise_ids)];
      ids.forEach((id) => {
        exerciseCounts[id] = (exerciseCounts[id] || 0) + 1;
      });

      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          const a = Math.min(ids[i], ids[j]);
          const b = Math.max(ids[i], ids[j]);
          const pairKey = `${a}-${b}`;
          pairCounts[pairKey] = (pairCounts[pairKey] || 0) + 1;
        }
      }
    });

    const rules: any[] = [];
    const minSupport = payload.min_support;
    const minConfidence = payload.min_confidence;

    Object.entries(pairCounts).forEach(([pairKey, count]) => {
      const [aStr, bStr] = pairKey.split('-');
      const a = parseInt(aStr);
      const b = parseInt(bStr);

      const support = count / (totalRoutines || 1);

      if (support >= minSupport) {
        const confidenceA = count / (exerciseCounts[a] || 1);
        const supportB = (exerciseCounts[b] || 0) / (totalRoutines || 1);
        const liftA = confidenceA / (supportB || 1);

        if (confidenceA >= minConfidence) {
          rules.push({
            antecedent_id: a,
            consequent_id: b,
            support: Math.round(support * 100) / 100,
            confidence: Math.round(confidenceA * 100) / 100,
            lift: Math.round(liftA * 100) / 100,
          });
        }

        const confidenceB = count / (exerciseCounts[b] || 1);
        const supportA = (exerciseCounts[a] || 0) / (totalRoutines || 1);
        const liftB = confidenceB / (supportA || 1);

        if (confidenceB >= minConfidence) {
          rules.push({
            antecedent_id: b,
            consequent_id: a,
            support: Math.round(support * 100) / 100,
            confidence: Math.round(confidenceB * 100) / 100,
            lift: Math.round(liftB * 100) / 100,
          });
        }
      }
    });

    return {
      success: true,
      fallback: true,
      rules: rules.sort((x, y) => y.lift - x.lift).slice(0, 15),
    };
  }
}