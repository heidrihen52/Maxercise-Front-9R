import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';

export interface UpdateMuscleGroupInput {
  name?: string;
  description?: string;
}

export interface UpdateMuscleInput {
  name?: string;
  description?: string;
  muscleGroupId?: number | null;
}

export async function listMusclesAndGroups() {
  return prisma.muscleGroups.findMany({
    where: { status: true },
    include: {
      muscles: { where: { status: true } },
    },
  });
}

export async function createMuscleGroup(data: { name: string; description: string; authorId: number }) {
  return prisma.muscleGroups.create({
    data: {
      name: data.name,
      description: data.description,
      author_id: data.authorId,
    },
  });
}

export async function createMuscle(data: { name: string; description: string; muscleGroupId: number; authorId: number }) {
  return prisma.muscle.create({
    data: {
      name: data.name,
      description: data.description,
      muscle_group_id: data.muscleGroupId,
      author_id: data.authorId,
    },
  });
}

export async function updateMuscleGroup(
  id: number,
  data: UpdateMuscleGroupInput
) {
  const existing = await prisma.muscleGroups.findUnique({
    where: { id },
  });

  if (!existing || !existing.status) {
    throw new AppError(404,'Grupo muscular no encontrado');
  }

  return prisma.muscleGroups.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && {
        description: data.description,
      }),
    },
  });
}

export async function updateMuscle(
  id: number,
  data: UpdateMuscleInput
) {
  const existing = await prisma.muscle.findUnique({
    where: { id },
  });

  if (!existing || !existing.status) {
    throw new AppError(404, 'Músculo no encontrado');
  }

  return prisma.muscle.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && {
        description: data.description,
      }),
      ...(data.muscleGroupId !== undefined && {
        muscle_group:
          data.muscleGroupId === null
            ? { disconnect: true }
            : { connect: { id: data.muscleGroupId } },
      }),
    },
  });
}

export async function deleteMuscleGroup(id: number) {
  const existing = await prisma.muscleGroups.findUnique({
    where: { id },
  });

  if (!existing || !existing.status) {
    throw new AppError(404, 'Grupo muscular no encontrado');
  }

  return prisma.muscleGroups.update({
    where: { id },
    data: {
      status: false,
    },
  });
}

export async function deleteMuscle(id: number) {
  const existing = await prisma.muscle.findUnique({
    where: { id },
  });

  if (!existing || !existing.status) {
    throw new AppError(404, 'Músculo no encontrado');
  }

  return prisma.muscle.update({
    where: { id },
    data: {
      status: false,
    },
  });
}