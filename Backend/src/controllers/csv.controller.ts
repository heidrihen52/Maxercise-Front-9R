import { Request, Response, NextFunction } from 'express';
import * as csvService from '../services/csv.service';

export async function exportCsv(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const csv = await csvService.exportUsersCsv();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="users_export.csv"');
    res.send(csv);
  } catch (error) {
    next(error);
  }
}

export async function importCsv(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'Archivo CSV requerido' });
      return;
    }

    const adminId = req.user!.id;
    const result = await csvService.importUsersFromCsv(req.file.buffer, adminId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
