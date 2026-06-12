import { Module } from '@nestjs/common';
import { AliyunOSSProvider } from './aliyun-oss.provider';
import { STORAGE_PROVIDER } from './storage-provider.interface';

@Module({
  providers: [
    AliyunOSSProvider,
    {
      provide: STORAGE_PROVIDER,
      useExisting: AliyunOSSProvider,
    },
  ],
  exports: [STORAGE_PROVIDER],
})
export class StorageModule {}
