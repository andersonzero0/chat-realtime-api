import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import * as path from 'path';
import * as sharp from 'sharp';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  async transform(value: Express.Multer.File & { isValid: boolean }) {
    if (value && value.isValid && value.mimetype.includes('image')) {
      return await this.compress(value);
    }
    return false;
  }

  async compress(value: Express.Multer.File) {
    try {
      const buffer = await sharp(value.buffer)
        .resize({ width: 1080, withoutEnlargement: true })
        .png({ quality: 80 })
        .toBuffer();

      if (buffer.byteLength > 10 * 1024 * 1024) {
        throw new BadRequestException('Image is too large');
      }

      return {
        ...value,
        buffer,
        size: buffer.byteLength,
        mimetype: 'image/png',
      };
    } catch (error) {
      throw error;
    }
  }

  async compressPreview(value: Express.Multer.File) {
    try {
      const nameValue = value.originalname.split('.')[0];
      const time = new Date().getTime();
      const fileName = `${nameValue}-${time}.webp`;

      const newFile = await sharp(value.buffer)
        .resize({ width: 720, withoutEnlargement: true })
        .webp({ quality: 5 })
        .blur(75)
        .toBuffer();

      if (newFile.byteLength > 10 * 1024 * 1024) {
        throw new BadRequestException('Image is too large');
      }

      return {
        ...value,
        filename: fileName,
        path: value.path.split(path.sep)[0] + path.sep + fileName,
        size: newFile.byteLength,
        mimetype: 'image/webp',
      };
    } catch (error) {
      throw error;
    }
  }
}
