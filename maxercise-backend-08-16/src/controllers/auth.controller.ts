import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import * as authService from '../services/auth.service';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { first_name, last_name, email, phone_number, body_type, birth_date, password } = req.body;

    if (!first_name || !last_name || !email || !phone_number || !body_type || !birth_date || !password) {
      res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
      return
    }

    const user = await authService.registerUser({
      first_name,
      last_name,
      email,
      birth_date,
      body_type,
      phone_number,
      password,
      role: Role.NORMAL,
    });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email y contraseña son obligatorios' });
      return;
    }

    const result = await authService.loginUser({ email, password });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: 'El email es obligatorio' });
      return;
    }

    const result = await authService.forgotPassword(email);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ success: false, message: 'Token y nueva contraseña son obligatorios' });
      return;
    }

    const result = await authService.resetPassword(token, newPassword);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}
