import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../src/config/mailer';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Solo hacemos mock del servicio de correo
jest.mock('../src/config/mailer', () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
}));

const app = createApp();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

describe('Auth Routes - /api/auth (Base de Datos Real)', () => {
  // Limpiador para usuarios generados durante las pruebas de Auth
  const cleanAuthUsers = async () => {
    try {
      await prisma.user.deleteMany({
        where: { email: { contains: '_authtest@' } },
      });
    } catch {
      // Ignorar restricciones en cascada si no hay registros
    }
  };

  beforeAll(async () => {
    await cleanAuthUsers();
  });

  afterEach(async () => {
    await cleanAuthUsers();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await cleanAuthUsers();
    await prisma.$disconnect();
  });

  // ==========================================
  // POST /api/auth/register
  // ==========================================
  describe('POST /api/auth/register', () => {
    it('debe registrar un nuevo usuario exitosamente en la BD real con rol NORMAL', async () => {
      const email = `juan_${Date.now()}_authtest@example.com`;
      const validPayload = {
        first_name: 'Juan',
        last_name: 'Pérez',
        email,
        phone_number: '1234567890',
        birth_date: '1995-05-15',
        password: 'password123',
        role: 'SUPER', // Intentamos forzar SUPER
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(validPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.role).toBe('NORMAL'); // Debe forzar NORMAL

      // Verificación directa en la BD Real
      const userInDb = await prisma.user.findUnique({ where: { email } });
      expect(userInDb).not.toBeNull();
      expect(userInDb?.role).toBe('NORMAL');

      expect(sendWelcomeEmail).toHaveBeenCalledWith(email, 'Juan');
    });

    it('debe devolver error 400 si faltan campos obligatorios', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: `incompleto_${Date.now()}_authtest@example.com` });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Todos los campos son obligatorios');
    });

    it('debe devolver error 409 si el correo ya está registrado en la BD', async () => {
      const email = `duplicado_${Date.now()}_authtest@example.com`;

      // Pre-creamos usuario en la BD
      const hashedPassword = await bcrypt.hash('password123', 10);
      await prisma.user.create({
        data: {
          first_name: 'Juan',
          last_name: 'Pérez',
          email,
          phone_number: '1234567890',
          birth_date: new Date('1995-05-15'),
          password: hashedPassword,
          role: 'NORMAL',
          status: true,
        },
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          first_name: 'Juan',
          last_name: 'Pérez',
          email,
          phone_number: '1234567890',
          birth_date: '1995-05-15',
          password: 'password123',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('El correo electrónico ya está registrado');
    });
  });

  // ==========================================
  // POST /api/auth/login
  // ==========================================
  describe('POST /api/auth/login', () => {
    it('debe iniciar sesión exitosamente y retornar token', async () => {
      const email = `login_success_${Date.now()}_authtest@example.com`;
      const hashedPassword = await bcrypt.hash('password123', 10);

      await prisma.user.create({
        data: {
          first_name: 'Juan',
          last_name: 'Pérez',
          email,
          phone_number: '1234567890',
          birth_date: new Date('1995-05-15'),
          password: hashedPassword,
          role: 'NORMAL',
          status: true,
        },
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email, password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(email);
    });

    it('debe devolver error 400 si no se envían credenciales', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('debe devolver error 401 con contraseña incorrecta', async () => {
      const email = `login_wrongpass_${Date.now()}_authtest@example.com`;
      const hashedPassword = await bcrypt.hash('password123', 10);

      await prisma.user.create({
        data: {
          first_name: 'Juan',
          last_name: 'Pérez',
          email,
          phone_number: '1234567890',
          birth_date: new Date('1995-05-15'),
          password: hashedPassword,
          role: 'NORMAL',
          status: true,
        },
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email, password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Credenciales inválidas');
    });

    it('debe devolver error 401 si el usuario está deshabilitado (status: false)', async () => {
      const email = `login_disabled_${Date.now()}_authtest@example.com`;
      const hashedPassword = await bcrypt.hash('password123', 10);

      await prisma.user.create({
        data: {
          first_name: 'Juan',
          last_name: 'Pérez',
          email,
          phone_number: '1234567890',
          birth_date: new Date('1995-05-15'),
          password: hashedPassword,
          role: 'NORMAL',
          status: false,
        },
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email, password: 'password123' });

      expect(response.status).toBe(401);
    });
  });

  // ==========================================
  // POST /api/auth/forgot-password
  // ==========================================
  describe('POST /api/auth/forgot-password', () => {
    it('debe responder con mensaje genérico sin importar si el correo existe o no', async () => {
      const email = `forgot_${Date.now()}_authtest@example.com`;
      const hashedPassword = await bcrypt.hash('password123', 10);

      await prisma.user.create({
        data: {
          first_name: 'Juan',
          last_name: 'Pérez',
          email,
          phone_number: '1234567890',
          birth_date: new Date('1995-05-15'),
          password: hashedPassword,
          role: 'NORMAL',
          status: true,
        },
      });

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(sendPasswordResetEmail).toHaveBeenCalled();
    });

    it('debe devolver 400 si no se proporciona el correo', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  // ==========================================
  // POST /api/auth/reset-password
  // ==========================================
  describe('POST /api/auth/reset-password', () => {
    it('debe restablecer la contraseña con un token válido y actualizar en la BD', async () => {
      const email = `reset_${Date.now()}_authtest@example.com`;
      const oldPassword = await bcrypt.hash('oldpassword123', 10);

      const user = await prisma.user.create({
        data: {
          first_name: 'Juan',
          last_name: 'Pérez',
          email,
          phone_number: '1234567890',
          birth_date: new Date('1995-05-15'),
          password: oldPassword,
          role: 'NORMAL',
          status: true,
        },
      });

      const token = jwt.sign({ id: user.id, email: user.email, purpose: 'password_reset' }, JWT_SECRET, {
        expiresIn: '1h',
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ token, newPassword: 'newpassword123' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Contraseña actualizada exitosamente');

      // Validar actualización en la BD real
      const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
      const matchesNew = await bcrypt.compare('newpassword123', updatedUser!.password);
      expect(matchesNew).toBe(true);
    });

    it('debe devolver error 400 si la contraseña nueva tiene menos de 8 caracteres', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'dummy_token', newPassword: '123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('La contraseña debe tener al menos 8 caracteres');
    });

    it('debe devolver error 400 si el token es inválido', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'token_invalido', newPassword: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Token de recuperación inválido o expirado');
    });
  });
});