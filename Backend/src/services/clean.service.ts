import { prisma } from '../config/prisma';

const TABLES = [
  'WorkoutLog',
  'UserFavoriteExercise',
  'UserActiveRoutine',
  'UserFavoriteRoutine',
  'UserRestrictions',
  'ExerciseMuscles',
  'ExerciseRestrictions',
  'RoutineExercise',
  'Media',
  'Exercise',
  'Routine',
  'Muscle',
  'MuscleGroups',
  'Restriction',
  'User',
];

export async function cleanDatabase() {
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0');

  for (const table of TABLES) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${table}\``);
  }

  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1');

  return { success: true, message: 'Todas las tablas han sido truncadas', tables: TABLES };
}
