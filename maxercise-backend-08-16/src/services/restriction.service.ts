import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';

export async function createRestriction(name: string, description: string, authorId: number) {
  return prisma.restriction.create({
    data: { name, description, author_id: authorId },
  });
}

export async function updateRestriction(id: number, data: { name?: string; description?: string }) {
  return prisma.restriction.update({
    where: { id },
    data,
  });
}

export async function deleteRestriction(id: number) {
  return prisma.restriction.update({
    where: { id },
    data: { status: false },
  });
}

// Auto-gestión del usuario
export async function getUserRestrictions(userId: number) {
  return prisma.userRestrictions.findMany({
    where: { user_id: userId, status: true },
    include: { restriction: true },
  });
}

export async function addUserRestriction(userId: number, restrictionId: number) {
  const existing = await prisma.userRestrictions.findFirst({
    where: { user_id: userId, restriction_id: restrictionId },
  });

  if (existing) {
    return prisma.userRestrictions.update({
      where: { id: existing.id },
      data: { status: true },
    });
  }

  return prisma.userRestrictions.create({
    data: { user_id: userId, restriction_id: restrictionId },
  });
}

export async function removeUserRestriction(userId: number, restrictionId: number) {
  const record = await prisma.userRestrictions.findFirst({
    where: { user_id: userId, restriction_id: restrictionId, status: true },
  });

  if (!record) throw new AppError(404, 'La restricción no está asignada al usuario');

  return prisma.userRestrictions.update({
    where: { id: record.id },
    data: { status: false },
  });
}

export async function getAllRestrictions() {
  return prisma.restriction.findMany({
    where: { status: true },
    orderBy: { name: 'asc' },
  });
}
