import { Body, Difficulty } from '@prisma/client';
import { prisma } from '../config/prisma';
import calculateAge from '../utils/calculateAge'

const EMPTY_STATS = {
  ageRanges: [] as Array<{ range: string; count: number }>,
  topRestrictions: [] as Array<{ name: string; count: number }>,
  somatotypes: [] as Array<{ bodyType: Body; count: number }>,
  registrationsPerSecond: [] as Array<{ second: string; count: number }>,
  exercisesAvailability: { available: 0, blocked: 0 },
  routinesByDifficulty: [] as Array<{ difficulty: Difficulty; count: number }>,
};



function ageRangeLabel(age: number): string {
  if (age <= 9) return '0-9';
  if (age <= 19) return '10-19';
  if (age <= 29) return '20-29';
  if (age <= 39) return '30-39';
  if (age <= 49) return '40-49';
  if (age <= 59) return '50-59';
  if (age <= 69) return '60-69';
  if (age <= 79) return '70-79';
  if (age <= 89) return '80-89';
  if (age <= 99) return '90-99';
  return '100+';
}

export async function getDashboardStats() {
  const userCount = await prisma.user.count({ where: { status: true } });

  if (userCount === 0) {
    return EMPTY_STATS;
  }

  const [users, restrictions, exercises, routines] = await Promise.all([
    prisma.user.findMany({ where: { status: true }, select: { id: true, birth_date: true, body_type: true, created_at: true } }),
    prisma.userRestrictions.groupBy({
      by: ['restriction_id'],
      where: { status: true },
      _count: { restriction_id: true },
      orderBy: { _count: { restriction_id: 'desc' } },
      take: 5,
    }),
    prisma.exercise.findMany({
      where: { status: true },
      include: {
        exercise_restrictions: { where: { status: true } },
      },
    }),
    prisma.routine.groupBy({
      by: ['difficulty'],
      where: { status: true },
      _count: { difficulty: true },
    }),
  ]);

  const ageMap = new Map<string, number>();
  for (const user of users) {
    const label = ageRangeLabel(calculateAge(user.birth_date));
    ageMap.set(label, (ageMap.get(label) ?? 0) + 1);
  }

  const restrictionDetails = await prisma.restriction.findMany({
    where: { id: { in: restrictions.map((r) => r.restriction_id) } },
    select: { id: true, name: true },
  });
  const restrictionNameMap = new Map(restrictionDetails.map((r) => [r.id, r.name]));

  const somatotypeMap = new Map<Body, number>();
  for (const user of users) {
    if (user.body_type) {
      somatotypeMap.set(
        user.body_type,
        (somatotypeMap.get(user.body_type) ?? 0) + 1
      );
    }
  }

  const regMap = new Map<string, number>();
  for (const user of users) {
    const second = user.created_at.toISOString().slice(0, 19);
    regMap.set(second, (regMap.get(second) ?? 0) + 1);
  }

  let blocked = 0;
  let available = 0;
  for (const ex of exercises) {
    if (ex.exercise_restrictions.length > 0) blocked++;
    else available++;
  }

  return {
    ageRanges: [
      '0-9',
      '10-19',
      '20-29',
      '30-39',
      '40-49',
      '50-59',
      '60-69',
      '70-79',
      '80-89',
      '90-99',
      '100+',
    ].map((range) => ({
      range,
      count: ageMap.get(range) ?? 0,
    })),
    topRestrictions: restrictions.map((r) => ({
      name: restrictionNameMap.get(r.restriction_id) ?? 'Desconocida',
      count: r._count.restriction_id,
    })),
    somatotypes: (Object.values(Body) as Body[]).map((bodyType) => ({
      bodyType,
      count: somatotypeMap.get(bodyType) ?? 0,
    })),
    registrationsPerSecond: Array.from(regMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([second, count]) => ({ second, count })),
    exercisesAvailability: { available, blocked },
    routinesByDifficulty: routines.map((r) => ({
      difficulty: r.difficulty,
      count: r._count.difficulty,
    })),
  };
}