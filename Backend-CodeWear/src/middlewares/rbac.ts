import { NextFunction, Response } from 'express';
import { QueryTypes } from 'sequelize';
import sequelize from '../config/database';
import { AuthRequest, UserRole } from '../types';

type RbacRole = UserRole | 'ADMIN' | 'CLIENT';

interface RoleRow {
  name: string;
}

function normalizeRole(role: string): string {
  return role.toLowerCase();
}

async function hasPersistedRole(userId: number, allowedRoles: RbacRole[]): Promise<boolean> {
  const normalizedRoles = allowedRoles.map((role) => normalizeRole(role));
  const placeholders = normalizedRoles.map(() => '?').join(', ');

  try {
    const roles = await sequelize.query<RoleRow>(
      `SELECT r.name
       FROM user_roles ur
       INNER JOIN roles r ON r.id = ur.role_id
       WHERE ur.user_id = ? AND LOWER(r.name) IN (${placeholders})
       LIMIT 1`,
      {
        replacements: [userId, ...normalizedRoles],
        type: QueryTypes.SELECT,
      }
    );

    return roles.length > 0;
  } catch (error) {
    console.error('Erro ao consultar roles persistidos:', error);
    return false;
  }
}

export const checkRole = (allowedRoles: RbacRole[]) => async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(403).json({ message: 'Acesso sem permissão para esta função.' });
    return;
  }

  const persistedAuthorization = await hasPersistedRole(req.user.id, allowedRoles);

  if (!persistedAuthorization) {
    res.status(403).json({ message: 'Acesso sem permissão para esta função.' });
    return;
  }

  next();
};

export const checkPermission = (permission: string) => async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(403).json({ message: 'Acesso sem permissão para esta função.' });
    return;
  }

  if (req.user.isAdmin || req.user.permissions.includes(permission)) {
    next();
    return;
  }

  res.status(403).json({ message: 'Acesso sem permissão para esta função.' });
};