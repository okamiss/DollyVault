import { Module } from '@nestjs/common';
import { StorageModule } from '../common/storage/storage.module';
import { UploadsController } from './uploads.controller';

@Module({
  imports: [StorageModule],
  controllers: [UploadsController],
})
export class UploadsModule {}
