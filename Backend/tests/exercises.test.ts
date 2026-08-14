import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import jwt from 'jsonwebtoken';

jest.setTimeout(30000);

// Mock de Supabase
jest.mock('../src/config/supabase', () => ({
  uploadExerciseMedia: jest.fn().mockResolvedValue({ publicUrl: 'https://storage.fake.com/media.jpg' }),
}));

const app = createApp();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

let normalUser: { id: number; role: string };
let superUser: { id: number; role: string };
let normalToken: string;
let superToken: string;
let testMuscleId: number; // 👈 Cambiado a number según el esquema Prisma

async function setupTestUsers() {
  try {
    if ((prisma as any).user) {
      const u1 = await (prisma as any).user.upsert({
        where: { email: 'user1_ex@test.com' },
        update: { role: 'NORMAL' },
        create: {
          email: 'user1_ex@test.com',
          password: 'password',
          role: 'NORMAL',
          first_name: 'User',
          last_name: 'One',
          phone_number: '1234567890',
          birth_date: new Date('1995-01-01'),
        },
      });
      const u2 = await (prisma as any).user.upsert({
        where: { email: 'user99_ex@test.com' },
        update: { role: 'SUPER' },
        create: {
          email: 'user99_ex@test.com',
          password: 'password',
          role: 'SUPER',
          first_name: 'Super',
          last_name: 'Admin',
          phone_number: '1234567890',
          birth_date: new Date('1995-01-01'),
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

// 📌 Función corregida para crear el Grupo Muscular y el Músculo de prueba
async function setupTestMuscle() {
  try {
    let group = await (prisma as any).muscleGroups?.findFirst();
    if (!group) {
      group = await (prisma as any).muscleGroups?.create({
        data: {
          name: 'Espalda Test',
          description: 'Grupo muscular de prueba para espalda',
          author_id: superUser.id, // 👈 AQUÍ FALTABA EL AUTOR
        },
      });
    }

    let muscle = await (prisma as any).muscle.findFirst({
      where: { name: 'Dorsal Ancho Test' },
    });

    if (!muscle) {
      muscle = await (prisma as any).muscle.create({
        data: {
          name: 'Dorsal Ancho Test',
          description: 'Descripción músculo test',
          muscle_group_id: group.id,
          author_id: superUser.id,
          status: true,
        },
      });
    }

    testMuscleId = muscle.id;
  } catch (error) {
    console.error('Error configurando músculo de prueba:', error);
    throw error;
  }
}

async function cleanExercisesDB() {
  try { await prisma.exerciseRestrictions.deleteMany({}); } catch {}
  try { await (prisma as any).exerciseMuscles?.deleteMany({}); } catch {}
  try { await (prisma as any).exerciseMedia?.deleteMany({}); } catch {}
  try { await prisma.exercise.deleteMany({}); } catch {}
  try { await prisma.userRestrictions.deleteMany({}); } catch {}
  try { await prisma.restriction.deleteMany({}); } catch {}
}

describe('Exercise Integration Tests - /api/exercises', () => {
  beforeAll(async () => {
    await cleanExercisesDB();
    await setupTestUsers();
    await setupTestMuscle(); // 👈 Se crea el músculo dinámico antes de ejecutar los tests
  });

  beforeEach(async () => {
    await cleanExercisesDB();
  });

  afterAll(async () => {
    await cleanExercisesDB();
    await prisma.$disconnect();
  });

  const postExercise = async (token: string, payload: any) => {
    const resMultipart = await request(app)
      .post('/api/exercises')
      .set('Authorization', `Bearer ${token}`)
      .field('title', payload.title)
      .field('description', payload.description)
      .field('instructions', payload.instructions)
      .field('muscleIds', JSON.stringify(payload.muscleIds))
      .field('restrictions', JSON.stringify(payload.restrictions));

    if (resMultipart.status === 201 || resMultipart.status === 403) {
      return resMultipart;
    }

    return request(app)
      .post('/api/exercises')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);
  };

  describe('GET /api/exercises', () => {
    it('debe listar todos los ejercicios desde la BD para un usuario sin restricciones', async () => {
      await prisma.exercise.createMany({
        data: [
          { title: 'Press de Banca', description: 'Pecho', instructions: 'Empujar barra', author_id: superUser.id, status: true },
          { title: 'Sentadilla', description: 'Pierna', instructions: 'Flexionar rodillas', author_id: superUser.id, status: true },
        ],
      });

      const response = await request(app)
        .get('/api/exercises')
        .set('Authorization', `Bearer ${normalToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('debe excluir ejercicios bloqueados por restricciones activas del usuario en BD', async () => {
      const rest = await prisma.restriction.create({
        data: { name: 'Lesión de Rodilla', description: 'Evitar impacto', status: true, author_id: superUser.id },
      });

      await prisma.userRestrictions.create({
        data: { user_id: normalUser.id, restriction_id: rest.id, status: true },
      });

      await prisma.exercise.create({
        data: { title: 'Press de Banca', description: 'Pecho', instructions: 'Empujar', author_id: superUser.id, status: true },
      });

      const ex2 = await prisma.exercise.create({
        data: { title: 'Sentadilla Pesada', description: 'Pierna', instructions: 'Bajar profundo', author_id: superUser.id, status: true },
      });

      await prisma.exerciseRestrictions.create({
        data: { exercise_id: ex2.id, restriction_id: rest.id, author_id: superUser.id } as any,
      });

      const response = await request(app)
        .get('/api/exercises')
        .set('Authorization', `Bearer ${normalToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const titles = response.body.data.map((e: any) => e.title);
      expect(titles).toContain('Press de Banca');
      expect(titles).not.toContain('Sentadilla Pesada');
    });
  });

  describe('POST /api/exercises', () => {
    const getValidPayload = () => ({
      title: 'Dominadas Estricta',
      description: 'Ejercicio multiarticular para espalda',
      instructions: 'Sujétate de la barra y sube la barbilla',
      muscleIds: [testMuscleId], // 👈 Ahora usa el ID real generado
      restrictions: [],
    });

    it('debe permitir crear un ejercicio en la BD a un usuario SUPER', async () => {
      const response = await postExercise(superToken, getValidPayload());

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      const dbCreated = await prisma.exercise.findFirst({
        where: { title: 'Dominadas Estricta' },
      });
      expect(dbCreated).not.toBeNull();
      expect(dbCreated?.author_id).toBe(superUser.id);
    });

    it('debe devolver 403 si un usuario NORMAL intenta crear un ejercicio', async () => {
      const response = await postExercise(normalToken, getValidPayload());

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/exercises/:id', () => {
    it('debe desactivar lógicamente un ejercicio en la BD con rol SUPER', async () => {
      const ex = await prisma.exercise.create({
        data: { title: 'Peso Muerto', description: 'Espalda baja', instructions: 'Levantar barra', author_id: superUser.id, status: true },
      });

      const response = await request(app)
        .delete(`/api/exercises/${ex.id}`)
        .set('Authorization', `Bearer ${superToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const dbUpdated = await prisma.exercise.findUnique({
        where: { id: ex.id },
      });
      expect(dbUpdated?.status).toBe(false);
    });
  });
});