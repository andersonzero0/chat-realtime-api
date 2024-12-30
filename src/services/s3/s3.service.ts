import { Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  DeleteObjectCommandInput,
  HeadObjectCommand,
  HeadObjectCommandInput,
  PutObjectCommand,
  PutObjectCommandInput,
  S3,
} from '@aws-sdk/client-s3';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { AwsConfig } from '../../config/configuration';

@Injectable()
export class S3Service {
  constructor(private configService: ConfigService) {}

  private configS3 = this.configService.get<AwsConfig>('aws')?.s3;

  getS3Bucket(): S3 {
    if (!this.configS3) {
      throw new Error('AWS credentials not found');
    }

    const { accessKeyId, secretAccessKey, region, endpoint } = this.configS3;

    return new S3({
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      region,
      endpoint,
      forcePathStyle: true,
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    try {
      if (!this.configS3) {
        throw new Error('AWS credentials not found');
      }

      const s3 = this.getS3Bucket();

      const { bucket, cdn_url } = this.configS3;

      let key = `${crypto.randomBytes(16).toString('hex')}_${file.originalname}`;
      key = key.trim();

      const params: PutObjectCommandInput = {
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const command = new PutObjectCommand(params);
      await s3.send(command);

      const url = `${cdn_url}/${key}`;

      return url;
    } catch (error) {
      throw error;
    }
  }

  async deleteFile(url: string): Promise<void> {
    try {
      if (!this.configS3) {
        throw new Error('AWS_BUCKET_NAME is not set');
      }

      const s3 = this.getS3Bucket();
      const key = this.extractKeyFromUrl(url);

      const { bucket } = this.configS3;

      if (!key) {
        throw new Error('Invalid URL');
      }

      const params: DeleteObjectCommandInput = {
        Bucket: bucket,
        Key: key,
      };

      const command = new DeleteObjectCommand(params);
      await s3.send(command);

      const fileExists = await this.checkFileExists(key);
      if (fileExists) {
        throw new Error('Failed to delete file');
      }

      return;
    } catch (error) {
      throw error;
    }
  }

  async checkFileExists(key: string): Promise<boolean> {
    try {
      if (!this.configS3) {
        throw new Error('AWS_BUCKET_NAME is not set');
      }

      const { bucket } = this.configS3;

      const s3 = this.getS3Bucket();
      const params: HeadObjectCommandInput = {
        Bucket: bucket,
        Key: key,
      };

      const command = new HeadObjectCommand(params);
      await s3.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      } else {
        throw error;
      }
    }
  }

  extractKeyFromUrl(url: string): string {
    const parts = url.split('/');
    return parts.slice(3).join('/');
  }
}
