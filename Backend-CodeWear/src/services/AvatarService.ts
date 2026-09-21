import fs from 'fs';
import User from '../models/UserModel';

export async function updateUserAvatar(userId: number, file: Express.Multer.File): Promise<string | null> {
  const user = await User.findByPk(userId);
  if (!user) {
    await removeUploadedFile(file.path, 'ERRO AO REMOVER AVATAR SEM USUÁRIO:');
    return null;
  }

  user.avatarUrl = `/uploads/${file.filename}`;

  try {
    await user.save();
    return user.avatarUrl;
  } catch (error) {
    await removeUploadedFile(file.path, 'ERRO AO REMOVER ARQUIVO DE AVATAR ÓRFÃO:');
    throw error;
  }
}

async function removeUploadedFile(filePath: string, message: string): Promise<void> {
  try {
    await fs.promises.unlink(filePath);
  } catch (cleanupError) {
    console.error(message, cleanupError);
  }
}