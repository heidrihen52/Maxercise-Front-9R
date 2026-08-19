import { Body, Role } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';

export async function getUserProfile(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      phone_number: true,
      birth_date: true,
      body_type: true,
      role: true,
      created_at: true,
      user_restrictions: {
        where: { status: true },
        include: { restriction: true },
      },
    },
  });

  if (!user) throw new AppError(404, 'Usuario no encontrado');
  return user;
}

export async function updateUserProfile(
  userId: number,
  data: { first_name?: string; last_name?: string; phone_number?: string; body_type: Body; birth_date?: string | Date}
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      ...data,
      birth_date: data.birth_date ? new Date(data.birth_date) : undefined,
    },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      phone_number: true,
      body_type: true,
      birth_date: true,
    },
  });
}

export async function listUsersPaginated(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const [total, users] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        role: true,
        body_type: true,
        birth_date: true,
        status: true,
        created_at: true,
      },
      orderBy: { id: 'desc' },
    }),
  ]);

  return { total, page, limit, totalPages: Math.ceil(total / limit), data: users };
}

export async function updateUserRole(userId: number, role: Role) {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, email: true, role: true },
  });
}

export async function updateUserStatus(userId: number, status: boolean) {
  return prisma.user.update({
    where: { id: userId },
    data: { status },
    select: { id: true, email: true, status: true },
  });
}