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
      body_type: true,
      birth_date: true,
      role: true,
      created_at: true,
      user_restrictions: {
        where: { status: true },
        include: { restriction: true },
      },
    },
  });

  if (!user) throw new AppError(404, 'Usuario no encontrado');

  const hasLogs = await prisma.workoutLog.findFirst({
    where: {
      user_id: userId,
      avg_heart_rate: { not: null }
    }
  });

  return {
    ...user,
    has_wearable: hasLogs !== null
  };
}

export async function updateUserProfile(
  userId: number,
  data: { 
    first_name?: string; 
    last_name?: string; 
    phone_number?: string; 
    body_type?: Body; 
    birth_date?: string | Date;
    restrictions?: string[];
  }
) {
  return prisma.$transaction(async (tx) => {
    const { restrictions, ...basicData } = data;
    
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        ...basicData,
        birth_date: basicData.birth_date ? new Date(basicData.birth_date) : undefined,
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

    if (restrictions !== undefined) {
      const dbRestrictions = await tx.restriction.findMany({
        where: { status: true },
      });

      const normalizedInput = restrictions.map(r => r.toLowerCase().replace(/_/g, ' '));
      const matchMap: Record<string, string> = {
        'lesion de rodilla': 'rodilla',
        'lesión_rodilla': 'rodilla',
        'hernia': 'hernia',
        'hipertension': 'hipertension',
        'hipertensión': 'hipertension',
        'embarazo': 'embarazo',
        'lesion de hombro': 'hombro',
        'tendinitis de hombro': 'hombro',
        'lesion de espalda': 'espalda',
        'lesion de muñeca': 'muneca',
        'lesion de cuello': 'cuello',
        'condicion cardiaca': 'cardiaca',
        'obesidad': 'obesidad',
        'asma': 'asma',
      };

      const matchedIds = dbRestrictions
        .filter(r => {
          const dbNameNorm = r.name.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/_/g, ' ');
          return normalizedInput.some(input => {
            const inputNorm = input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return dbNameNorm.includes(inputNorm) || inputNorm.includes(dbNameNorm) ||
              (matchMap[input] && dbNameNorm.includes(matchMap[input]));
          });
        })
        .map(r => r.id);

      await tx.userRestrictions.deleteMany({
        where: { user_id: userId },
      });

      if (matchedIds.length > 0) {
        await tx.userRestrictions.createMany({
          data: matchedIds.map(restriction_id => ({
            user_id: userId,
            restriction_id,
          })),
        });
      }
    }

    return updatedUser;
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