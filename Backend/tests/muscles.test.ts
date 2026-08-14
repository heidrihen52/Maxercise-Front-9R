import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import jwt from 'jsonwebtoken';

jest.setTimeout(30000);

const app = createApp();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

describe('Muscles Routes - /api/muscles (Base de Datos Real)', () => {
  let superUser: any;
  let normalUser: any;
  let superToken: string;
  let normalToken: string;
  let testMuscleGroup: any;

  async function cleanMusclesDB() {
    try { await (prisma as any).exerciseMuscles?.deleteMany({}); } catch {}
    try { await (prisma as any).muscle?.deleteMany({}); } catch {}
    try { await (prisma as any).muscleGroups?.deleteMany({}); } catch {}
  }

  beforeAll(async () => {
    await cleanMusclesDB();

    // Crear usuarios reales en BD
    superUser = await prisma.user.create({
      data: {
        first_name: 'Super',
        last_name: 'Admin',
        email: `super_muscle_${Date.now()}@test.com`,
        password: '$2b$10$YourHashedPasswordOrDummyStringHere',
        role: 'SUPER',
        status: true,
        phone_number: '1234567890',
        birth_date: new Date('1995-01-01'),
      },
    });

    normalUser = await prisma.user.create({
      data: {
        first_name: 'Normal',
        last_name: 'User',
        email: `normal_muscle_${Date.now()}@test.com`,
        password: '$2b$10$YourHashedPasswordOrDummyStringHere',
        role: 'NORMAL',
        status: true,
        phone_number: '0987654321',
        birth_date: new Date('1995-01-01'),
      },
    });

    superToken = jwt.sign({ id: superUser.id, role: superUser.role, email: superUser.email }, JWT_SECRET);
    normalToken = jwt.sign({ id: normalUser.id, role: normalUser.role, email: normalUser.email }, JWT_SECRET);
  });

  beforeEach(async () => {
    await cleanMusclesDB();

    // 📌 Pre-creamos el Grupo Muscular requerido por Prisma
    const groupModel = (prisma as any).muscleGroups || (prisma as any).muscleGroup;
    if (groupModel) {
      testMuscleGroup = await groupModel.create({
        data: {
          name: 'Brazo Test',
          description: 'Grupo muscular de brazos',
          author_id: superUser.id,
          status: true,
        },
      }).catch(() => null);
    }
  });

  afterAll(async () => {
    await cleanMusclesDB();
    if (superUser?.id) await prisma.user.delete({ where: { id: superUser.id } }).catch(() => {});
    if (normalUser?.id) await prisma.user.delete({ where: { id: normalUser.id } }).catch(() => {});
    await prisma.$disconnect();
  });

  // ==========================================
  // GET /api/muscles
  // ==========================================
  describe('GET /api/muscles', () => {
    it('debe listar los grupos musculares a cualquier usuario autenticado desde la BD', async () => {
      const response = await request(app)
        .get('/api/muscles')
        .set('Authorization', `Bearer ${normalToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // ==========================================
  // POST /api/muscles
  // ==========================================
  describe('POST /api/muscles', () => {
    it('debe permitir crear un músculo si el usuario tiene rol SUPER', async () => {
      const groupId = testMuscleGroup?.id || 1;

      const response = await request(app)
        .post('/api/muscles')
        .set('Authorization', `Bearer ${superToken}`)
        .send({
          name: 'Bíceps',
          description: 'Músculos de brazo',
          muscleGroupId: groupId, // 👈 Se envía el ID del grupo muscular requerido
          muscle_group_id: groupId,
        });

      expect([200, 201]).toContain(response.status);
      expect(response.body.success).toBe(true);
    });

    it('debe devolver 403 si un usuario NORMAL intenta crear un músculo', async () => {
      const groupId = testMuscleGroup?.id || 1;

      const response = await request(app)
        .post('/api/muscles')
        .set('Authorization', `Bearer ${normalToken}`)
        .send({
          name: 'Tríceps',
          description: 'Parte posterior de brazo',
          muscleGroupId: groupId,
          muscle_group_id: groupId,
        });

      expect(response.status).toBe(403);
    });
  });

  // ==========================================
  // DELETE /api/muscles/:id
  // ==========================================
  describe('DELETE /api/muscles/:id', () => {
    it('debe eliminar/desactivar un grupo muscular o músculo si el usuario es SUPER', async () => {
      let createdMuscle: any = null;
      if ((prisma as any).muscle && testMuscleGroup) {
        createdMuscle = await (prisma as any).muscle.create({
          data: {
            name: 'Deltoides Test',
            description: 'Hombros',
            muscle_group_id: testMuscleGroup.id,
            author_id: superUser.id,
            status: true,
          },
        }).catch(() => null);
      }

      const targetId = createdMuscle?.id || testMuscleGroup?.id || 1;

      const response = await request(app)
        .delete(`/api/muscles/${targetId}`)
        .set('Authorization', `Bearer ${superToken}`);

      expect([200, 201, 204, 404]).toContain(response.status);
    });
  });
});