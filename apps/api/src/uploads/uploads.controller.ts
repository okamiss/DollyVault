import {
  BadRequestException,
  Controller,
  Inject,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  STORAGE_PROVIDER,
  StorageProvider,
} from '../common/storage/storage-provider.interface';

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly storageProvider: StorageProvider,
  ) {}

  @Post('images')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024, files: 5 },
    }),
  )
  async uploadImages(@UploadedFiles() files: Express.Multer.File[] = []) {
    if (files.length === 0) {
      throw new BadRequestException('请选择要上传的图片');
    }
    if (files.length > 5) {
      throw new BadRequestException('最多只能上传 5 张图片');
    }

    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
        throw new BadRequestException('仅支持 JPG、PNG、WEBP、GIF 图片');
      }
    }

    const items = await Promise.all(
      files.map((file) =>
        this.storageProvider.upload({
          buffer: file.buffer,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
        }),
      ),
    );

    return { items };
  }
}
