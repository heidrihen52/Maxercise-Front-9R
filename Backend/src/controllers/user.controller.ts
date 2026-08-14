import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import * as userService from '../services/user.service';

/**
 * Obtiene el perfil del usuario autenticado
 */
export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const user = await userService.getUserProfile(userId);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Actualiza la información personal del perfil autenticado
 */
export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { first_name, last_name, body_type, phone_number, birth_date, restrictions } = req.body;

    const updatedUser = await userService.updateUserProfile(userId, {
      first_name,
      last_name,
      phone_number,
      body_type,
      birth_date: birth_date ? new Date(birth_date) : undefined,
      restrictions,
    });

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Lista usuarios paginados (exclusivo Admin)
 */
export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const result = await userService.listUsersPaginated(page, limit);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Cambia el rol de un usuario (exclusivo Admin)
 */
export async function changeRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = parseInt(req.params.id, 10);
    const { role } = req.body;

    const updatedUser = await userService.updateUserRole(userId, role as Role);

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Cambia el estado activo/inactivo de un usuario (exclusivo Admin)
 */
export async function changeStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = parseInt(req.params.id, 10);
    const { status } = req.body;

    const updatedUser = await userService.updateUserStatus(userId, Boolean(status));

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
}