import { describe, expect, it } from 'vitest';
import {
  buildAliyunOssConfig,
  buildObjectKey,
} from './aliyun-oss.provider';

describe('Aliyun OSS provider helpers', () => {
  it('reads required OSS configuration from environment-like input', () => {
    const config = buildAliyunOssConfig({
      ALIYUN_OSS_REGION: 'oss-cn-hangzhou',
      ALIYUN_OSS_BUCKET: 'dollyvault',
      ALIYUN_OSS_ACCESS_KEY_ID: 'id',
      ALIYUN_OSS_ACCESS_KEY_SECRET: 'secret',
      ALIYUN_OSS_PUBLIC_BASE_URL: 'https://cdn.example.com/',
      ALIYUN_OSS_UPLOAD_DIR: 'demo',
    });

    expect(config.publicBaseUrl).toBe('https://cdn.example.com');
    expect(config.uploadDir).toBe('demo');
  });

  it('throws a clear error when required OSS variables are missing', () => {
    expect(() => buildAliyunOssConfig({})).toThrow(
      'Missing required Aliyun OSS environment variables',
    );
  });

  it('builds a stable object key under the configured upload directory', () => {
    const key = buildObjectKey({
      uploadDir: 'dollyvault',
      originalName: '玲娜贝儿.png',
      mimeType: 'image/png',
      now: new Date('2026-06-12T02:00:00.000Z'),
      randomId: 'abc123',
    });

    expect(key).toBe('dollyvault/2026/06/12/abc123.png');
  });
});
