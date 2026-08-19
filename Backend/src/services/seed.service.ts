import { Body, Difficulty, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma';
import { emitToRoom } from '../config/socket';

export interface SeedOptions {
  count?: number;
  bodyTypeDistribution?: Partial<Record<Body, number>>;
  restrictionPrevalence?: number;
  roomId?: string;
  batchSize?: number;
}

const DEFAULT_BODY_DIST: Record<Body, number> = {
  ECTOMORFO: 0.33,
  MESOMORFO: 0.34,
  ENDOMORFO: 0.33,
};

const FIRST_NAMES = [
  'Carlos', 'María', 'José', 'Ana', 'Luis', 'Laura', 'Miguel', 'Carmen', 'Jorge', 'Elena',
  'David', 'Sofía', 'Daniel', 'Lucía', 'Alejandro', 'Marta', 'Pablo', 'Paula', 'Juan', 'Diego',
  'Valeria', 'Javier', 'Sara', 'Andrés', 'Daniela', 'Fernando', 'Valentina', 'Ricardo', 'Camila', 'Roberto'
];

const LAST_NAMES = [
  'García', 'Martínez', 'López', 'González', 'Rodríguez', 'Fernández', 'Pérez', 'Gómez', 'Sánchez', 'Díaz',
  'Romero', 'Suárez', 'Torres', 'Ruiz', 'Ramírez', 'Flores', 'Acosta', 'Benítez', 'Medina', 'Vargas',
  'Castro', 'Ortiz', 'Silva', 'Reyes', 'Ramos', 'Mendoza', 'Morales', 'Rojas', 'Cruz', 'Navarro'
];

const RESTRICTION_NAMES = [
  'Lesión de rodilla',
  'Hernia discal',
  'Hipertensión',
  'Embarazo',
  'Artritis',
  'Tendinitis de hombro',
];

const MUSCLE_GROUPS = [
  { name: 'Pecho', description: 'Músculos pectorales' },
  { name: 'Espalda', description: 'Dorsales y trapecio' },
  { name: 'Piernas', description: 'Cuádriceps y glúteos' },
  { name: 'Brazos', description: 'Bíceps y tríceps' },
  { name: 'Core', description: 'Abdominales y oblicuos' },
];

const EXERCISE_ACTIONS = [
  'Sentadilla', 'Press', 'Peso muerto', 'Dominadas', 'Remo', 'Flexiones', 'Zancadas', 'Elevaciones', 'Curl', 'Extensión',
  'Aperturas', 'Jalón', 'Plancha', 'Hip thrust', 'Encogimientos'
];

const EXERCISE_EQUIPMENT = [
  'con mancuernas', 'con barra', 'en máquina', 'con polea', 'con banda de resistencia', 'con peso corporal', 'en banco inclinado', 'a una mano'
];

function pickBodyType(distribution: Record<Body, number>): Body {
  const roll = Math.random();
  let cumulative = 0;
  for (const [body, weight] of Object.entries(distribution) as [Body, number][]) {
    cumulative += weight;
    if (roll <= cumulative) return body;
  }
  return Body.MESOMORFO;
}

function emitProgress(roomId: string | undefined, event: string, payload: unknown) {
  if (roomId) {
    emitToRoom(roomId, event, payload);
  }
}

export async function seedDatabase(options: SeedOptions = {}) {
  const count = options.count ?? 50;
  const batchSize = options.batchSize ?? 10;
  const bodyDist = { ...DEFAULT_BODY_DIST, ...options.bodyTypeDistribution };
  const restrictionPrevalence = options.restrictionPrevalence ?? 0.25;
  const roomId = options.roomId;

  const metrics = {
    users: 0,
    exercises: 0,
    routines: 0,
    restrictions: 0,
  };

  emitProgress(roomId, 'seed_progress', { phase: 'init', message: 'Iniciando seed...', percent: 0 });

  const adminPassword = await bcrypt.hash('Admin123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@adaptive-exercise.local' },
    update: {},
    create: {
      first_name: 'Super',
      last_name: 'Admin',
      email: 'admin@adaptive-exercise.local',
      phone_number: '0000000000',
      password: adminPassword,
      birth_date: new Date('1990-01-01'),
      role: Role.SUPER,
    },
  });

  const restrictions = [];
  for (const name of RESTRICTION_NAMES) {
    const restriction = await prisma.restriction.upsert({
      where: { name },
      update: {},
      create: {
        name,
        description: `Restricción médica: ${name}`,
        author_id: admin.id,
      },
    });
    restrictions.push(restriction);
  }
  metrics.restrictions = restrictions.length;

  // Grupos musculares y músculos
  const createdMuscles = [];
  for (const group of MUSCLE_GROUPS) {
    const mg = await prisma.muscleGroups.upsert({
      where: { name: group.name },
      update: {},
      create: {
        name: group.name,
        description: group.description,
        author_id: admin.id,
      },
    });

    const m = await prisma.muscle.upsert({
      where: { name: `Músculo ${group.name}` },
      update: {},
      create: {
        name: `Músculo ${group.name}`,
        description: `Músculo principal de ${group.name}`,
        muscle_group_id: mg.id,
        author_id: admin.id,
      },
    });
    createdMuscles.push(m);
  }

  // Ejercicios Masivos (Aleatorios)
  const difficulties: Difficulty[] = [Difficulty.PRINCIPIANTE, Difficulty.INTERMEDIO, Difficulty.AVANZADO];
  const bodies: Body[] = [Body.ECTOMORFO, Body.MESOMORFO, Body.ENDOMORFO];
  const createdExercises = [];
  
  for (let i = 0; i < 50; i++) {
    const action = EXERCISE_ACTIONS[Math.floor(Math.random() * EXERCISE_ACTIONS.length)];
    const equip = EXERCISE_EQUIPMENT[Math.floor(Math.random() * EXERCISE_EQUIPMENT.length)];
    const title = `${action} ${equip} ${Date.now()}_${i}`; // Ensure uniqueness
    
    const exercise = await prisma.exercise.create({
      data: {
        title,
        description: `Descripción generada para ${action}`,
        instructions: `Instrucciones detalladas para ejecutar ${title}`,
        difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
        author_id: admin.id,
        exercise_muscles: {
          create: {
            muscle_id: createdMuscles[Math.floor(Math.random() * createdMuscles.length)].id,
            author_id: admin.id,
          },
        },
        ...(Math.random() > 0.5 && restrictions.length > 0
          ? {
              exercise_restrictions: {
                create: {
                  restriction_id: restrictions[Math.floor(Math.random() * restrictions.length)].id,
                  author_id: admin.id,
                },
              },
            }
          : {}),
      },
    });
    createdExercises.push(exercise);
  }
  metrics.exercises = await prisma.exercise.count(); // Will fetch accurate total later, just updating local logic

  // Rutinas Masivas (Aleatorias)
  const createdRoutines = [];
  for (let r = 0; r < 20; r++) {
    const routineTitle = `Rutina Aleatoria ${Date.now()}_${r}`;
    
    // Pick 3 to 5 random exercises
    const numExercises = Math.floor(Math.random() * 3) + 3; 
    const randomExercises = [...createdExercises].sort(() => 0.5 - Math.random()).slice(0, numExercises);

    const routine = await prisma.routine.create({
      data: {
        title: routineTitle,
        description: `Rutina dinámica generada ${r + 1}`,
        difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
        body_type: bodies[Math.floor(Math.random() * bodies.length)],
        author_id: admin.id,
        exercises: {
          create: randomExercises.map((ex, idx) => ({
            exercise_id: ex.id,
            reps: Math.floor(Math.random() * 10) + 8,
            sets: Math.floor(Math.random() * 3) + 3,
            day_number: 1,
            order: idx + 1,
            author_id: admin.id,
          })),
        },
      },
    });
    createdRoutines.push(routine);
  }
  metrics.routines = createdRoutines.length;

  // Generación de usuarios en lotes
  const defaultUserPassword = await bcrypt.hash('User123!', 10);

  for (let i = 0; i < count; i += batchSize) {
    const currentBatch = Math.min(batchSize, count - i);

    for (let j = 0; j < currentBatch; j++) {
      const idx = i + j + 1;
      const userBodyType = pickBodyType(bodyDist);
      const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const userEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}_${idx}_${Date.now()}@adaptive-exercise.local`.replace(/\s+/g, '');

      // Random date between 1970 and 2005
      const start = new Date(1970, 0, 1).getTime();
      const end = new Date(2005, 11, 31).getTime();
      const randomDate = new Date(start + Math.random() * (end - start));

      // Random created_at between 1 year ago and now
      const createdAtDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);

      const user = await prisma.user.create({
        data: {
          first_name: firstName,
          last_name: lastName,
          email: userEmail,
          phone_number: `555000${idx.toString().padStart(4, '0')}`,
          password: defaultUserPassword,
          birth_date: randomDate,
          role: Role.NORMAL,
          body_type: userBodyType,
          created_at: createdAtDate,
        },
      });

      if (Math.random() < restrictionPrevalence && restrictions.length > 0) {
        const randomRestriction = restrictions[Math.floor(Math.random() * restrictions.length)];
        await prisma.userRestrictions.create({
          data: {
            user_id: user.id,
            restriction_id: randomRestriction.id,
          },
        });
      }

      const matchingRoutine = createdRoutines.find((rt) => rt.body_type === userBodyType) || createdRoutines[0];
      if (matchingRoutine) {
        await prisma.userActiveRoutine.create({
          data: {
            user_id: user.id,
            routine_id: matchingRoutine.id,
          },
        });
      }

      metrics.users++;
    }

    const percent = Math.round(((i + currentBatch) / count) * 100);
    emitProgress(roomId, 'seed_progress', {
      phase: 'generating_users',
      message: `Generados ${metrics.users}/${count} usuarios`,
      percent,
    });
    emitProgress(roomId, 'metrics_update', metrics);
  }

  const finalMetrics = {
    users: await prisma.user.count(),
    exercises: await prisma.exercise.count(),
    routines: await prisma.routine.count(),
    restrictions: await prisma.restriction.count(),
  };

  emitProgress(roomId, 'metrics_update', finalMetrics);

  emitProgress(roomId, 'seed_progress', {
    phase: 'completed',
    message: 'Proceso de seed finalizado con éxito',
    percent: 100,
  });

  return finalMetrics;
}

export async function getDatabaseMetrics() {
  return {
    users: await prisma.user.count(),
    exercises: await prisma.exercise.count(),
    routines: await prisma.routine.count(),
    restrictions: await prisma.restriction.count(),
  };
}