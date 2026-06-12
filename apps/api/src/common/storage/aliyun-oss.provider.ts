import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OSS from 'ali-oss';
import { randomUUID } from 'crypto';
import path from 'path';
import {
  StoredObject,
  StorageProvider,
  UploadInput,
} from './storage-provider.interface';

export interface AliyunOssConfig {
  region: string;
  endpoint?: string;
  bucket: string;
  accessKeyId: string;
  accessKeySecret: string;
  publicBaseUrl: string;
  uploadDir: string;
}

type EnvLike = Record<string, string | undefined>;

const REQUIRED_ENV_KEYS = [
  'ALIYUN_OSS_REGION',
  'ALIYUN_OSS_BUCKET',
  'ALIYUN_OSS_ACCESS_KEY_ID',
  'ALIYUN_OSS_ACCESS_KEY_SECRET',
  'ALIYUN_OSS_PUBLIC_BASE_URL',
] as const;

export function buildAliyunOssConfig(env: EnvLike): AliyunOssConfig {
  const missing = REQUIRED_ENV_KEYS.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required Aliyun OSS environment variables: ${missing.join(', ')}`,
    );
  }

  return {
    region: env.ALIYUN_OSS_REGION!,
    endpoint: env.ALIYUN_OSS_ENDPOINT || undefined,
    bucket: env.ALIYUN_OSS_BUCKET!,
    accessKeyId: env.ALIYUN_OSS_ACCESS_KEY_ID!,
    accessKeySecret: env.ALIYUN_OSS_ACCESS_KEY_SECRET!,
    publicBaseUrl: env.ALIYUN_OSS_PUBLIC_BASE_URL!.replace(/\/+$/, ''),
    uploadDir: (env.ALIYUN_OSS_UPLOAD_DIR || 'dollyvault').replace(
      /^\/+|\/+$/g,
      '',
    ),
  };
}

export function buildObjectKey(input: {
  uploadDir: string;
  originalName: string;
  mimeType: string;
  now?: Date;
  randomId?: string;
}): string {
  const now = input.now ?? new Date();
  const randomId = input.randomId ?? randomUUID();
  const extFromName = path.extname(input.originalName).toLowerCase();
  const ext =
    extFromName ||
    {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
    }[input.mimeType] ||
    '';
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');

  return `${input.uploadDir}/${year}/${month}/${day}/${randomId}${ext}`;
}

@Injectable()
export class AliyunOSSProvider implements StorageProvider {
  private readonly config: AliyunOssConfig;
  private readonly client: OSS;

  constructor(configService: ConfigService) {
    try {
      this.config = buildAliyunOssConfig({
        ALIYUN_OSS_REGION: configService.get<string>('ALIYUN_OSS_REGION'),
        ALIYUN_OSS_ENDPOINT: configService.get<string>('ALIYUN_OSS_ENDPOINT'),
        ALIYUN_OSS_BUCKET: configService.get<string>('ALIYUN_OSS_BUCKET'),
        ALIYUN_OSS_ACCESS_KEY_ID: configService.get<string>(
          'ALIYUN_OSS_ACCESS_KEY_ID',
        ),
        ALIYUN_OSS_ACCESS_KEY_SECRET: configService.get<string>(
          'ALIYUN_OSS_ACCESS_KEY_SECRET',
        ),
        ALIYUN_OSS_PUBLIC_BASE_URL: configService.get<string>(
          'ALIYUN_OSS_PUBLIC_BASE_URL',
        ),
        ALIYUN_OSS_UPLOAD_DIR: configService.get<string>(
          'ALIYUN_OSS_UPLOAD_DIR',
        ),
      });
    } catch (error) {
      throw new InternalServerErrorException((error as Error).message);
    }

    this.client = new OSS({
      region: this.config.region,
      endpoint: this.config.endpoint,
      bucket: this.config.bucket,
      accessKeyId: this.config.accessKeyId,
      accessKeySecret: this.config.accessKeySecret,
    });
  }

  async upload(input: UploadInput): Promise<StoredObject> {
    const objectKey = buildObjectKey({
      uploadDir: this.config.uploadDir,
      originalName: input.originalName,
      mimeType: input.mimeType,
    });

    await this.client.put(objectKey, input.buffer, {
      mime: input.mimeType,
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

    return {
      provider: 'aliyun-oss',
      objectKey,
      url: `${this.config.publicBaseUrl}/${objectKey}`,
      mimeType: input.mimeType,
      size: input.size,
    };
  }
}
