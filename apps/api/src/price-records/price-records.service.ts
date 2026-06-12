import { Injectable, NotFoundException } from '@nestjs/common';
import { CollectionEventType } from '@prisma/client';
import { EventsService } from '../events/events.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePriceRecordDto } from './dto/price-record.dto';

@Injectable()
export class PriceRecordsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
  ) {}

  list(catalogItemId?: string) {
    return this.prisma.priceRecord.findMany({
      where: catalogItemId ? { catalogItemId } : {},
      include: { catalogItem: true, user: { select: { id: true, username: true } } },
      orderBy: { recordDate: 'desc' },
      take: 100,
    });
  }

  async create(userId: string, dto: CreatePriceRecordDto) {
    const catalogItem = await this.prisma.catalogItem.findUnique({
      where: { id: dto.catalogItemId },
    });
    if (!catalogItem) {
      throw new NotFoundException('图鉴不存在');
    }

    const record = await this.prisma.priceRecord.create({
      data: {
        catalogItemId: dto.catalogItemId,
        userId,
        price: dto.price,
        recordDate: dto.recordDate ? new Date(dto.recordDate) : new Date(),
        source: dto.source || null,
        note: dto.note || null,
      },
      include: { catalogItem: true },
    });

    await this.eventsService.create({
      userId,
      type: CollectionEventType.PriceUpdated,
      title: `记录价格：${catalogItem.name} ¥${dto.price}`,
      catalogItemId: catalogItem.id,
      snapshot: JSON.parse(JSON.stringify(record)),
    });

    return record;
  }
}
