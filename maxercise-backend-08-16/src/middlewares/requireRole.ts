import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AppError } from '../utils/AppError';

export function requireRole(allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, 'No autenticado'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError(403, 'No tienes permisos para acceder a este recurso'));
      return;
    }

    next();
  };
}
