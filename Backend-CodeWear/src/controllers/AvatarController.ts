import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { AuthRequest } from '../types';
import { updateUserAvatar } from '../services/AvatarService';

export function handleAvatarUploadError(error: unknown, _req: Request, res: Response, next: NextFunction): void {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ message: 'A imagem do avatar deve ter no máximo 5 MB.' });
    return;
  }

  if (error instanceof Error) {
    res.status(400).json({ message: error.message });
    return;
  }

  next(error);
}

export async function uploadAvatar(req: Request, res: Response): Promise<Response> {
  const authenticatedRequest = req as AuthRequest;
  if (!req.file || !authenticatedRequest.user) {
    return res.status(400).json({ message: 'Imagem não enviada.' });
  }

  try {
    const avatarUrl = await updateUserAvatar(authenticatedRequest.user.id, req.file);
    if (!avatarUrl) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    return res.status(200).json({ avatarUrl });
  } catch (error) {
    console.error('ERRO AO ATUALIZAR AVATAR:', error);
    return res.status(500).json({ message: 'Erro ao atualizar o avatar.' });
  }
}