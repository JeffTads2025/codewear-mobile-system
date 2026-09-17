import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { NextFunction, Request, Response } from 'express';

const uploadDirectory = path.resolve(process.cwd(), 'uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });

const upload = multer({
  dest: uploadDirectory,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    const allowedMimeTypes: Record<string, string[]> = {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    };
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = allowedMimeTypes[file.mimetype];

    if (!allowedExtensions || !allowedExtensions.includes(fileExtension)) {
      callback(new Error('Envie uma imagem JPG, JPEG, PNG ou WEBP válida.'));
      return;
    }

    callback(null, true);
  },
});

export const avatarUpload = upload.single('avatar');

export async function validateAvatarContent(req: Request, _res: Response, next: NextFunction): Promise<void> {
  if (!req.file) {
    next();
    return;
  }

  try {
    const fileBuffer = await fs.promises.readFile(req.file.path);
    const detectedMimeType = detectImageMimeType(fileBuffer);

    if (!detectedMimeType || detectedMimeType !== req.file.mimetype) {
      await fs.promises.unlink(req.file.path).catch(() => undefined);
      next(new Error('Envie uma imagem JPG, JPEG ou WEBP válida.'));
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
}

function detectImageMimeType(fileBuffer: Buffer): string | null {
  const isJpeg = fileBuffer.length >= 3
    && fileBuffer[0] === 0xff
    && fileBuffer[1] === 0xd8
    && fileBuffer[2] === 0xff;
  if (isJpeg) return 'image/jpeg';

  const isPng = fileBuffer.length >= 8
    && fileBuffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (isPng) return 'image/png';

  const isWebp = fileBuffer.length >= 12
    && fileBuffer.toString('ascii', 0, 4) === 'RIFF'
    && fileBuffer.toString('ascii', 8, 12) === 'WEBP';
  if (isWebp) return 'image/webp';

  return null;
}