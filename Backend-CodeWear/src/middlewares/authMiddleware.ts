import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { QueryTypes } from 'sequelize';
import { AuthRequest } from '../types';
import User from '../models/UserModel';
import sequelize from '../config/database';

interface AuthorizationRow {
  roleName: string;
  permissionName: string | null;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;


  if (!authHeader?.startsWith('Bearer ')) {
    console.log("ALERTA: Requisição sem header de autorização.");
    return res.status(401).json({ message: "Use o cabeçalho Authorization: Bearer <token>" });
  }

  const token = authHeader.slice('Bearer '.length).trim();
  const jwtSecret = process.env.JWT_SECRET;

  if (!token || !jwtSecret) {
    return res.status(401).json({ message: "Sessão inválida ou servidor sem chave JWT configurada" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as {
      id: number;
      name: string;
    };

    const currentUser = await User.findByPk(decoded.id, {
      attributes: ['id', 'name', 'isActive']
    });

    if (!currentUser || currentUser.isActive === false) {
      return res.status(401).json({ message: 'Conta cancelada ou indisponível' });
    }

    const authorizationRows = await sequelize.query<AuthorizationRow>(
      `SELECT r.name AS roleName, p.name AS permissionName
       FROM user_roles ur
       INNER JOIN roles r ON r.id = ur.role_id
       LEFT JOIN role_permissions rp ON rp.role_id = r.id
       LEFT JOIN permissions p ON p.id = rp.permission_id
       WHERE ur.user_id = ?`,
      { replacements: [currentUser.id], type: QueryTypes.SELECT }
    );

    req.user = {
      id: currentUser.id,
      name: currentUser.name,
      permissions: authorizationRows
        .map((row) => row.permissionName)
        .filter((permission): permission is string => Boolean(permission)),
      isAdmin: authorizationRows.some((row) => row.roleName.toLowerCase() === 'admin'),
    };

    next();
  } catch (error) {
    console.log("ERRO JWT:", error);
    return res.status(401).json({ message: "Sessão expirada ou inválida" });
  }
};
