import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ImportExportService {
  constructor(private readonly prisma: PrismaService) {}

  exportCatalog() {
    return this.prisma.catalogItem.findMany({
      include: { images: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  exportInventory(userId: string) {
    return this.prisma.collectionItem.findMany({
      where: { userId },
      include: {
        images: true,
        catalogItem: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  exportPrices(userId: string) {
    return this.prisma.priceRecord.findMany({
      where: { OR: [{ userId }, { userId: null }] },
      include: { catalogItem: true },
      orderBy: { recordDate: 'desc' },
    });
  }

  importData(_userId: string, body: unknown) {
    if (!body || typeof body !== 'object') {
      throw new BadRequestException('导入文件格式不正确');
    }
    return {
      ok: true,
      message: '已完成基础格式校验。批量导入写入将在下一阶段开放。',
    };
  }
}
