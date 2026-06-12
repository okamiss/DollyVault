export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');

export interface UploadInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface StoredObject {
  provider: string;
  objectKey: string;
  url: string;
  mimeType?: string;
  size?: number;
}

export interface StorageProvider {
  upload(input: UploadInput): Promise<StoredObject>;
}
