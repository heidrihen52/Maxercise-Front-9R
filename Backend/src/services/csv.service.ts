import { Readable } from 'stream';
import csv from 'csv-parser';
import bcrypt from 'bcrypt';
import { Prisma, Role } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';

export interface CsvUserRow {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  birth_date: string;
  password?: string;
  role?: string;
  restrictions?: string;
}

export async function exportUsersCsv(): Promise<string> {
  const users = await prisma.user.findMany({
    where: { status: true },
    include: {
      user_restrictions: {
        where: { status: true },
        include: { restriction: { select: { name: true } } },
      },
    },
    orderBy: { id: 'asc' },
  });

  const header = 'id,first_name,last_name,email,phone_number,role,restrictions,created_at';
  const rows = users.map((user) => {
    const restrictions = user.user_restrictions.map((ur) => ur.restriction.name).join(';');
    return [
      user.id,
      `"${user.first_name}"`,
      `"${user.last_name}"`,
      user.email,
      user.phone_number,
      user.role,
      `"${restrictions}"`,
      user.created_at.toISOString(),
    ].join(',');
  });

  return [header, ...rows].join('\n');
}

function parseRole(value?: string): Role {
  const upper = (value ?? 'NORMAL').toUpperCase();
  if (Object.values(Role).includes(upper as Role)) {
    return upper as Role;
  }
  return Role.NORMAL;
}

async function resolveRestrictions(
  tx: Prisma.TransactionClient,
  restrictionNames: string[],
  adminId: number,
  cache: Map<string, number>
): Promise<number[]> {
  const ids: number[] = [];

  for (const name of restrictionNames) {
    const trimmed = name.trim();
    if (!trimmed) continue;

    const key = trimmed.toLowerCase();

    if (cache.has(key)) {
      ids.push(cache.get(key)!);
      continue;
    }

    const created = await tx.restriction.create({
      data: {
        name: trimmed,
        description: `Importado: ${trimmed}`,
        author_id: adminId,
      },
    });

    cache.set(key, created.id);
    ids.push(created.id);
  }

  return ids;
}

export async function importUsersFromCsv(buffer: Buffer, adminId: number) {
  const rows: CsvUserRow[] = await new Promise((resolve, reject) => {
    const results: CsvUserRow[] = [];
    Readable.from(buffer)
      .pipe(csv())
      .on('data', (row: CsvUserRow) => results.push(row))
      .on('end', () => resolve(results))
      .on('error', reject);
  });

  if (rows.length === 0) {
    throw new AppError(400, 'El archivo CSV está vacío');
  }

  const batchSize = 50;
  let imported = 0;
  let skipped = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);

    await prisma.$transaction(async (tx) => {

      // Cargar restricciones una sola vez por lote
      const restrictionCache = new Map<string, number>();

      const existingRestrictions = await tx.restriction.findMany({
        select: {
          id: true,
          name: true,
        },
      });

      for (const restriction of existingRestrictions) {
        restrictionCache.set(
          restriction.name.toLowerCase(),
          restriction.id
        );
      }

      for (const row of batch) {
        const exists = await tx.user.findUnique({
          where: { email: row.email },
        });

        if (exists) {
          skipped++;
          continue;
        }

        const plainPassword = row.password ?? 'TempPass123!';
        const hashed = await bcrypt.hash(plainPassword, 10);

        const user = await tx.user.create({
          data: {
            first_name: row.first_name,
            last_name: row.last_name,
            email: row.email,
            phone_number: row.phone_number,
            birth_date: row.birth_date ?? new Date('2000-01-01'),
            password: hashed,
            role: parseRole(row.role),
          },
        });

        if (row.restrictions) {
          const names = row.restrictions
            .split(';')
            .filter(Boolean);

          const restrictionIds = await resolveRestrictions(
            tx,
            names,
            adminId,
            restrictionCache
          );

          if (restrictionIds.length > 0) {
            await tx.userRestrictions.createMany({
              data: restrictionIds.map((restriction_id) => ({
                user_id: user.id,
                restriction_id,
              })),
            });
          }
        }

        imported++;
      }
    });
  }

  return { imported, skipped, total: rows.length };
}
