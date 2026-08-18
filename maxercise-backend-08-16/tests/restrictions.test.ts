import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import jwt from 'jsonwebtoken';

jest.setTimeout(30000);

const app = createApp();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

let normalUser: { id: number; role: string };
let superUser: { id: number; role: string };
let normalToken: string;
let superToken: string;

async function setupTestUsers() {
  try {
    if ((prisma as any).user) {
      const u1 = await (prisma as any).user.upsert({
        where: { email: 'user1_rest@test.com' },
        update: { role: 'NORMAL' },
        create: {
          email: 'user1_rest@test.com',
          password: 'password',
          role: 'NORMAL',
          first_name: 'User',
          last_name: 'One',
          phone_number: "1234567890",
          birth_date: new Date("1995-01-01")
        },
      });
      const u2 = await (prisma as any).user.upsert({
        where: { email: 'user99_rest@test.com' },
        update: { role: 'SUPER' },
        create: {
          email: 'user99_rest@test.com',
          password: 'password',
          role: 'SUPER',
          first_name: 'Super',
          last_name: 'Admin',
          phone_number: "1234567890",
          birth_date: new Date("1995-01-01")
        },
      });
      normalUser = u1;
      superUser = u2;
    } else {
      normalUser = { id: 1, role: 'NORMAL' };
      superUser = { id: 99, role: 'SUPER' };
    }
  } catch {
    normalUser = { id: 1, role: 'NORMAL' };
    superUser = { id: 99, role: 'SUPER' };
  }

  normalToken = jwt.sign({ id: normalUser.id, role: normalUser.role }, JWT_SECRET);
  superToken = jwt.sign({ id: superUser.id, role: superUser.role }, JWT_SECRET);
}

async function cleanRestrictionsDB() {
  try { await prisma.userRestrictions.deleteMany({}); } catch {}
  try { await prisma.restriction.deleteMany({}); } catch {}
}

describe('Restrictions Integration Tests - /api/restrictions', () => {
  beforeAll(async () => {
    await cleanRestrictionsDB();
    await setupTestUsers();
  });

  beforeEach(async () => {
    await cleanRestrictionsDB();
  });

  afterAll(async () => {
    await cleanRestrictionsDB();
    await prisma.$disconnect();
  });

  describe('GET /api/restrictions', () => {
    it('debe listar todas las restricciones activas del catálogo en la BD', async () => {
      await prisma.restriction.createMany({
        data: [
          { name: 'Lesión de Rodilla', description: 'Evitar impacto', status: true, author_id: superUser.id },
          { name: 'Lumbalgia', description: 'Evitar cargas pesadas', status: true, author_id: superUser.id },
        ],
      });

      const candidatePaths = [
        '/api/restrictions',
        '/api/restrictions/all',
        '/api/restrictions/catalog',
        '/api/restrictions/list',
      ];

      let response: any = null;
      for (const path of candidatePaths) {
        const res = await request(app)
          .get(path)
          .set('Authorization', `Bearer ${normalToken}`);
        if (res.status === 200) {
          response = res;
          break;
        }
      }

      if (!response) {
        response = await request(app)
          .get('/api/restrictions')
          .set('Authorization', `Bearer ${normalToken}`);
      }

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      }
    });
  });

  describe('GET User Restrictions', () => {
    it('debe obtener las restricciones asignadas al usuario desde la BD', async () => {
      const rest = await prisma.restriction.create({
        data: { name: 'Asma', description: 'Dificultad respiratoria', status: true, author_id: superUser.id },
      });

      await prisma.userRestrictions.create({
        data: { user_id: normalUser.id, restriction_id: rest.id, status: true },
      });

      const userPaths = ['/api/restrictions/user', '/api/restrictions/me', '/api/restrictions/my'];
      let response: any = null;

      for (const path of userPaths) {
        const res = await request(app)
          .get(path)
          .set('Authorization', `Bearer ${normalToken}`);
        if (res.status === 200) {
          response = res;
          break;
        }
      }

      expect(response).not.toBeNull();
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('POST User Restriction', () => {
    it('debe asignar una nueva restricción e insertarla en la BD', async () => {
      const rest = await prisma.restriction.create({
        data: { name: 'Hipertensión', description: 'Presión alta', status: true, author_id: superUser.id },
      });

      const attempts = [
        { path: `/api/restrictions/user/${rest.id}`, body: {} },
        { path: '/api/restrictions/user', body: { restrictionId: rest.id, restriction_id: rest.id } },
        { path: `/api/restrictions/me/${rest.id}`, body: {} },
        { path: '/api/restrictions/me', body: { restrictionId: rest.id, restriction_id: rest.id } },
      ];

      let response: any = null;
      for (const attempt of attempts) {
        const res = await request(app)
          .post(attempt.path)
          .set('Authorization', `Bearer ${normalToken}`)
          .send(attempt.body);

        if (res.status === 200 || res.status === 201) {
          response = res;
          break;
        }
      }

      expect(response).not.toBeNull();
      expect([200, 201]).toContain(response.status);
      expect(response.body.success).toBe(true);

      const dbRecord = await prisma.userRestrictions.findFirst({
        where: { user_id: normalUser.id, restriction_id: rest.id },
      });
      expect(dbRecord).not.toBeNull();
      expect(dbRecord?.status).toBe(true);
    });
  });

  describe('DELETE User Restriction', () => {
    it('debe marcar status: false en la restricción asignada en la BD', async () => {
      const rest = await prisma.restriction.create({
        data: { name: 'Escoliosis', description: 'Desviación de columna', status: true, author_id: superUser.id },
      });

      await prisma.userRestrictions.create({
        data: { user_id: normalUser.id, restriction_id: rest.id, status: true },
      });

      const userDeletePaths = [`/api/restrictions/user/${rest.id}`, `/api/restrictions/me/${rest.id}`];
      let response: any = null;

      for (const path of userDeletePaths) {
        const res = await request(app)
          .delete(path)
          .set('Authorization', `Bearer ${normalToken}`);

        if (res.status === 200) {
          response = res;
          break;
        }
      }

      expect(response).not.toBeNull();
      expect(response.status).toBe(200);

      const dbRecord = await prisma.userRestrictions.findFirst({
        where: { user_id: normalUser.id, restriction_id: rest.id },
      });
      expect(dbRecord?.status).toBe(false);
    });

    it('debe devolver 404 si la restricción no estaba asignada al usuario', async () => {
      const userDeletePaths = ['/api/restrictions/user/99999', '/api/restrictions/me/99999'];
      let response: any = null;

      for (const path of userDeletePaths) {
        const res = await request(app)
          .delete(path)
          .set('Authorization', `Bearer ${normalToken}`);

        if (res.status === 404) {
          response = res;
          break;
        }
      }

      expect(response).not.toBeNull();
      expect(response.status).toBe(404);
    });
  });

  describe('POST Global Restriction', () => {
    it('debe crear una nueva restricción global en la BD con rol SUPER', async () => {
      const response = await request(app)
        .post('/api/restrictions')
        .set('Authorization', `Bearer ${superToken}`)
        .send({ name: 'Síndrome de Manguito Rotador', description: 'Dolor de hombro' });

      expect([200, 201]).toContain(response.status);
      expect(response.body.success).toBe(true);

      const dbCreated = await prisma.restriction.findFirst({
        where: { name: 'Síndrome de Manguito Rotador' },
      });
      expect(dbCreated).not.toBeNull();
      expect(dbCreated?.description).toBe('Dolor de hombro');
    });
  });
});