import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Role, Body } from '@prisma/client';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../config/mailer';
import { AppError } from '../utils/AppError';

const SALT_ROUNDS = 12;

export interface RegisterInput {
  first_name: string;
  last_name: string;
  email: string;
  birth_date: string | Date;
  body_type?: Body,
  phone_number: string;
  password: string;
  role?: Role;
}

export interface LoginInput {
  email: string;
  password: string;
}

function signToken(payload: { id: number; email: string; role: Role }): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);
}

function signResetToken(userId: number, email: string): string {
  return jwt.sign({ id: userId, email, purpose: 'password_reset' }, env.jwtSecret, {
    expiresIn: env.jwtResetExpiresIn,
  } as jwt.SignOptions);
}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });

  if (existing) {
    throw new AppError(409, 'El correo electrónico ya está registrado');
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      first_name: input.first_name,
      last_name: input.last_name,
      email: input.email,
      phone_number: input.phone_number,
      password: hashedPassword,
      body_type: input.body_type,
      birth_date: new Date(input.birth_date),
      role: input.role ?? Role.NORMAL,
    },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      phone_number: true,
      role: true,
      created_at: true,
    },
  });

  await sendWelcomeEmail(user.email, user.first_name);

  return user;
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user || !user.status) {
    throw new AppError(401, 'Credenciales inválidas');
  }

  const valid = await bcrypt.compare(input.password, user.password);

  if (!valid) {
    throw new AppError(401, 'Credenciales inválidas');
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  return {
    token,
    user: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { message: 'Si el correo existe, recibirás instrucciones de recuperación' };
  }

  const resetToken = signResetToken(user.id, user.email);
  await sendPasswordResetEmail(user.email, resetToken);

  return { message: 'Si el correo existe, recibirás instrucciones de recuperación' };
}

interface ResetTokenPayload {
  id: number;
  email: string;
  purpose: string;
}

export async function resetPassword(token: string, newPassword: string) {
  if (!newPassword || newPassword.length < 8) {
    throw new AppError(400, 'La contraseña debe tener al menos 8 caracteres');
  }

  let decoded: ResetTokenPayload;
  try {
    decoded = jwt.verify(token, env.jwtSecret) as ResetTokenPayload;
  } catch {
    throw new AppError(400, 'Token de recuperación inválido o expirado');
  }

  if (decoded.purpose !== 'password_reset') {
    throw new AppError(400, 'Token de recuperación inválido');
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });

  if (!user || user.email !== decoded.email) {
    throw new AppError(404, 'Usuario no encontrado');
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  return { message: 'Contraseña actualizada exitosamente' };
}
