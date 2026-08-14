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
  ECTOMORFO: 0.15,
  MESOMORFO: 0.45,
  ENDOMORFO: 0.4,
};

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

const REAL_EXERCISES = [
  {
    title: 'Sentadilla',
    description: 'Ejercicio fundamental para el desarrollo de la fuerza en piernas y glúteos.',
    instructions: 'Coloca la barra sobre tus trapecios, desciende flexionando las rodillas manteniendo la espalda recta hasta que los muslos estén paralelos al suelo, y empuja hacia arriba.',
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=400&auto=format&fit=crop',
    muscleIndex: 2, // Piernas
  },
  {
    title: 'Press de banca',
    description: 'El rey de los ejercicios de empuje para tren superior, enfocado en el pectoral.',
    instructions: 'Acuéstate en el banco, sujeta la barra con agarre ligeramente más ancho que los hombros, bájala al pecho controlado y empuja con fuerza hacia arriba.',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=400&auto=format&fit=crop',
    muscleIndex: 0, // Pecho
  },
  {
    title: 'Peso muerto',
    description: 'Ejercicio compuesto para el desarrollo de toda la cadena posterior (espalda, glúteos e isquiotibiales).',
    instructions: 'Colócate frente a la barra, flexiona caderas y rodillas, mantén la espalda neutra y levanta el peso extendiendo caderas y rodillas simultáneamente.',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400&auto=format&fit=crop',
    muscleIndex: 1, // Espalda
  },
  {
    title: 'Dominadas',
    description: 'Ejercicio de tracción con peso corporal ideal para ensanchar la espalda.',
    instructions: 'Cuélgate de la barra con agarre prono, tira con tus codos hacia abajo para elevar tu cuerpo hasta que la barbilla pase la barra, y baja controlado.',
    image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=400&auto=format&fit=crop',
    muscleIndex: 1, // Espalda
  },
  {
    title: 'Plancha',
    description: 'Ejercicio isométrico clave para fortalecer el core y la estabilidad abdominal.',
    instructions: 'Apóyate sobre tus antebrazos y puntas de los pies, mantén el cuerpo alineado como una tabla sin elevar la cadera y contrae el abdomen.',
    image: 'https://images.unsplash.com/photo-1566241477600-ac026ad43874?q=80&w=400&auto=format&fit=crop',
    muscleIndex: 4, // Core
  },
  {
    title: 'Zancadas',
    description: 'Excelente para trabajar cuádriceps y glúteos de forma unilateral y mejorar el equilibrio.',
    instructions: 'Da un paso largo al frente, desciende la rodilla trasera hasta casi tocar el suelo formando ángulos de 90 grados, y regresa a la posición inicial.',
    image: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?q=80&w=400&auto=format&fit=crop',
    muscleIndex: 2, // Piernas
  },
  {
    title: 'Remo con mancuerna',
    description: 'Enfocado en el desarrollo de la espalda media y el dorsal ancho.',
    instructions: 'Apoya una rodilla y mano en el banco, con la espalda plana tira de la mancuerna hacia tu cadera manteniendo el codo pegado al cuerpo.',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400&auto=format&fit=crop',
    muscleIndex: 1, // Espalda
  },
  {
    title: 'Flexiones',
    description: 'Clásico ejercicio de empuje corporal para pecho, hombros y tríceps.',
    instructions: 'Colócate en posición de plancha alta, baja el pecho doblando los codos hacia atrás en 45 grados hasta tocar el suelo y empuja hacia arriba.',
    image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=400&auto=format&fit=crop',
    muscleIndex: 0, // Pecho
  },
  {
    title: 'Hip thrust',
    description: 'El mejor ejercicio aislado para el desarrollo de la fuerza y volumen de los glúteos.',
    instructions: 'Apoya la espalda alta en un banco, coloca la barra sobre tu pelvis y empuja la cadera hacia arriba contrayendo fuertemente los glúteos arriba.',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400&auto=format&fit=crop',
    muscleIndex: 2, // Piernas
  },
  {
    title: 'Elevaciones laterales',
    description: 'Ejercicio de aislamiento para desarrollar la cabeza lateral del deltoides (hombros anchos).',
    instructions: 'Con una mancuerna en cada mano, elévalas hacia los lados manteniendo una ligera flexión en los codos hasta la altura de los hombros.',
    image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=400&auto=format&fit=crop',
    muscleIndex: 3, // Brazos
  }
];

const REAL_ROUTINES = [
  {
    title: 'Rutina de Fuerza - Cuerpo Completo (Full Body)',
    description: 'Diseñada para principiantes que buscan construir una base sólida de fuerza en todo el cuerpo. Ideal para somatotipo mesomorfo.',
    difficulty: Difficulty.PRINCIPIANTE,
    bodyType: Body.MESOMORFO,
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400&auto=format&fit=crop',
    exerciseIndices: [0, 1, 4] // Sentadilla, Press de banca, Plancha
  },
  {
    title: 'Rutina Split de Hipertrofia (Ectomorfos)',
    description: 'Rutina dividida enfocada en la ganancia de masa muscular pura, espaciada para una recuperación máxima en ectomorfos.',
    difficulty: Difficulty.INTERMEDIO,
    bodyType: Body.ECTOMORFO,
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400&auto=format&fit=crop',
    exerciseIndices: [2, 3, 6] // Peso muerto, Dominadas, Remo con mancuerna
  },
  {
    title: 'Rutina de Pérdida de Peso (Endomorfos)',
    description: 'Alta intensidad combinando ejercicios musculares y de alta frecuencia para quemar calorías en endomorfos.',
    difficulty: Difficulty.INTERMEDIO,
    bodyType: Body.ENDOMORFO,
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400&auto=format&fit=crop',
    exerciseIndices: [4, 5, 7] // Plancha, Zancadas, Flexiones
  },
  {
    title: 'Rutina Tren Superior (Upper Body Focus)',
    description: 'Enfocada en esculpir pecho, espalda, hombros y brazos con ejercicios de tracción y empuje.',
    difficulty: Difficulty.AVANZADO,
    bodyType: Body.MESOMORFO,
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=400&auto=format&fit=crop',
    exerciseIndices: [1, 3, 7, 9] // Press de banca, Dominadas, Flexiones, Elevaciones laterales
  },
  {
    title: 'Rutina de Piernas Completa (Lower Body Focus)',
    description: 'Desarrolla cuádriceps, glúteos e isquiotibiales con cargas progresivas y alto volumen.',
    difficulty: Difficulty.AVANZADO,
    bodyType: Body.ENDOMORFO,
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=400&auto=format&fit=crop',
    exerciseIndices: [0, 5, 8] // Sentadilla, Zancadas, Hip thrust
  },
  {
    title: 'Rutina de Acondicionamiento Físico General',
    description: 'Enfoque mixto para mejorar resistencia muscular, estabilidad del core y salud general.',
    difficulty: Difficulty.PRINCIPIANTE,
    bodyType: Body.MESOMORFO,
    image: 'https://images.unsplash.com/photo-1566241477600-ac026ad43874?q=80&w=400&auto=format&fit=crop',
    exerciseIndices: [4, 5, 7] // Plancha, Zancadas, Flexiones
  }
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
  const createdMuscles: any[] = [];
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

  // Ejercicios coherentes
  const createdExercises: any[] = [];
  for (let i = 0; i < REAL_EXERCISES.length; i++) {
    const item = REAL_EXERCISES[i];
    let exercise = await prisma.exercise.findFirst({ where: { title: item.title } });
    if (!exercise) {
      exercise = await prisma.exercise.create({
        data: {
          title: item.title,
          description: item.description,
          instructions: item.instructions,
          author_id: admin.id,
          exercise_muscles: {
            create: {
              muscle_id: createdMuscles[item.muscleIndex % createdMuscles.length].id,
              author_id: admin.id,
            },
          },
          media: {
            create: {
              type: 'THUMBNAIL',
              url: item.image,
            }
          },
          ...(i % 3 === 0 && restrictions.length > 0
            ? {
                exercise_restrictions: {
                  create: {
                    restriction_id: restrictions[i % restrictions.length].id,
                    author_id: admin.id,
                  },
                },
              }
            : {}),
        },
      });
    }
    createdExercises.push(exercise);
  }
  metrics.exercises = createdExercises.length;

  // Rutinas coherentes
  const createdRoutines: any[] = [];
  for (let r = 0; r < REAL_ROUTINES.length; r++) {
    const item = REAL_ROUTINES[r];
    let routine = await prisma.routine.findFirst({ where: { title: item.title } });
    if (!routine) {
      routine = await prisma.routine.create({
        data: {
          title: item.title,
          description: item.description,
          difficulty: item.difficulty,
          body_type: item.bodyType,
          author_id: admin.id,
          media: {
            create: {
              type: 'THUMBNAIL',
              url: item.image,
            }
          },
          exercises: {
            create: item.exerciseIndices.map((exIdx, idx) => ({
              exercise_id: createdExercises[exIdx].id,
              reps: 10 + idx * 2,
              sets: 3,
              day_number: 1,
              order: idx + 1,
              author_id: admin.id,
            })),
          },
        },
      });
    }
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
      const userEmail = `user${idx}_${Date.now()}@adaptive-exercise.local`;

      const user = await prisma.user.create({
        data: {
          first_name: `Usuario`,
          last_name: `${idx}`,
          email: userEmail,
          phone_number: `555000${idx.toString().padStart(4, '0')}`,
          password: defaultUserPassword,
          birth_date: new Date(1985 + (idx % 25), idx % 12, (idx % 28) + 1),
          role: Role.NORMAL,
        },
      });

      if (Math.random() < restrictionPrevalence && restrictions.length > 0) {
        const randomRestriction = restrictions[idx % restrictions.length];
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

  emitProgress(roomId, 'seed_progress', {
    phase: 'completed',
    message: 'Proceso de seed finalizado con éxito',
    percent: 100,
  });

  return metrics;
}