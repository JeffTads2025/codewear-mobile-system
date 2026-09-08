import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, UserRole } from '../types';
import User from '../models/UserModel';
import { isCancelledEmail } from '../utils/accountCancellation';

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
      role: 'admin' | 'client'
    };

    const currentUser = await User.findByPk(decoded.id, {
      attributes: ['id', 'name', 'role', 'email']
    });

    if (!currentUser || isCancelledEmail(currentUser.email)) {
      return res.status(401).json({ message: 'Conta cancelada ou indisponível' });
    }

    req.user = {
      id: currentUser.id,
      name: currentUser.name,
      role: currentUser.role
    };

    next();
  } catch (error) {
    console.log("ERRO JWT:", error);
    return res.status(401).json({ message: "Sessão expirada ou inválida" });
  }
};

export const authorizeRole = (...allowedRoles: UserRole[]) => (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Acesso sem permissão para esta função.' });
  }

  next();
};