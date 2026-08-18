import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import jwt from 'jsonwebtoken';

const app = createApp();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

describe('Users Routes - /api/users (Base de Datos Real)', () => {
  let superUser: any;
  let normalUser: any;
  let superToken: string;
  let normalToken: string;

  // 1. Preparar datos reales en la BD antes de correr las pruebas
  beforeAll(async () => {
    // Creamos un Superusuario real en la BD
    superUser = await prisma.user.create({
      data: {
        first_name: 'Admin',
        last_name: 'Super',
        email: `super_${Date.now()}@example.com`, // Email único para evitar conflictos
        password: '$2b$10$YourHashedPasswordOrDummyStringHere',
        role: 'SUPER',
        status: true,
        phone_number: '1234567890',
        birth_date: new Date('1995-01-01'),
      },
    });

    // Creamos un Usuario Normal real en la BD
    normalUser = await prisma.user.create({
      data: {
        first_name: 'Juan',
        last_name: 'Pérez',
        email: `normal_${Date.now()}@example.com`,
        password: '$2b$10$YourHashedPasswordOrDummyStringHere',
        role: 'NORMAL',
        status: true,
        phone_number: '0987654321',
        birth_date: new Date('1995-01-01'),
      },
    });

    // Generamos los tokens utilizando los IDs REALES de la BD
    superToken = jwt.sign({ id: superUser.id, role: superUser.role, email: superUser.email }, JWT_SECRET);
    normalToken = jwt.sign({ id: normalUser.id, role: normalUser.role, email: normalUser.email }, JWT_SECRET);
  });

  // 2. Limpiar los datos insertados al finalizar
  afterAll(async () => {
    if (superUser) await prisma.user.delete({ where: { id: superUser.id } });
    if (normalUser) await prisma.user.delete({ where: { id: normalUser.id } });
    await prisma.$disconnect();
  });

  // ==========================================
  // GET /api/users/me (Perfil)
  // ==========================================
  describe('GET /api/users/me (Perfil del usuario)', () => {
    it('debe obtener la información del usuario autenticado', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${superToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(superUser.id);
    });

    it('debe devolver 401 si no se envía un token de autorización', async () => {
      const response = await request(app).get('/api/users/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================
  // PUT /api/users/me (Actualizar Perfil)
  // ==========================================
  describe('PUT /api/users/me (Actualizar perfil)', () => {
    it('debe actualizar los datos del usuario', async () => {
      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${superToken}`)
        .send({ first_name: 'Juan Carlos' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  // ==========================================
  // GET /api/users (Listar Usuarios - SUPER)
  // ==========================================
  describe('GET /api/users (Listar usuarios - Solo SUPER)', () => {
    it('debe permitir a un usuario SUPER listar todos los usuarios', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${superToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('debe devolver 403 si un usuario NORMAL intenta listar usuarios', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${normalToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================
  // PATCH /api/users/:id/status (Cambiar Estado)
  // ==========================================
  describe('PATCH /api/users/:id/status', () => {
    it('debe permitir cambiar el estado si el usuario es SUPER', async () => {
      const response = await request(app)
        .patch(`/api/users/${normalUser.id}/status`)
        .set('Authorization', `Bearer ${superToken}`)
        .send({ status: false });

      expect(response.status).toBe(200);
    });
  });

  // ==========================================
  // PATCH /api/users/:id/role (Cambiar Rol)
  // ==========================================
  describe('PATCH /api/users/:id/role', () => {
    it('debe permitir cambiar el rol si el usuario es SUPER', async () => {
      const response = await request(app)
        .patch(`/api/users/${normalUser.id}/role`)
        .set('Authorization', `Bearer ${superToken}`)
        .send({ role: 'SUPER' });

      expect(response.status).toBe(200);
    });
  });
});