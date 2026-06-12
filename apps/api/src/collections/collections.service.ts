import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
  CollectionEventType,
  CollectionStatus,
  Prisma,
} from '@prisma/client';
import { EventsService } from '../events/events.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCollectionDto, UpdateCollectionDto } from './dto/collection.dto';

@Injectable()
export class CollectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
  ) {}

  list(
    userId: string,
    filters: { status?: CollectionStatus; series?: string; sort?: string },
  ) {
    const orderBy =
      filters.sort === 'priceAsc'
        ? { purchasePrice: 'asc' as const }
        : filters.sort === 'priceDesc'
          ? { purchasePrice: 'desc' as const }
          : filters.sort === 'timeAsc'
            ? { purchaseDate: 'asc' as const }
            : { createdAt: 'desc' as const };

    return this.prisma.collectionItem.findMany({
      where: {
        userId,
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.series
          ? {
              catalogItem: {
                series: { contains: filters.series, mode: 'insensitive' },
              },
            }
          : {}),
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        catalogItem: {
          include: {
            images: { orderBy: { sortOrder: 'asc' } },
            priceRecords: { orderBy: { recordDate: 'desc' }, take: 1 },
          },
        },
      },
      orderBy,
      take: 100,
    });
  }

  async create(userId: string, dto: CreateCollectionDto) {
    const catalogItem = await this.prisma.catalogItem.findUnique({
      where: { id: dto.catalogItemId },
    });
    if (!catalogItem) {
      throw new NotFoundException('图鉴不存在');
    }

    const images = dto.images ?? [];
    const item = await this.prisma.collectionItem.create({
      data: {
        userId,
        catalogItemId: dto.catalogItemId,
        purchasePrice: dto.purchasePrice ?? null,
        purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : null,
        purchaseChannel: dto.purchaseChannel || null,
        condition: dto.condition,
        status: dto.status ?? CollectionStatus.Holding,
        estimatedPrice: dto.estimatedPrice ?? null,
        note: dto.note || null,
        images: {
          create: images.map((image, index) => ({
            url: image.url,
            objectKey: image.objectKey,
            provider: image.provider ?? 'aliyun-oss',
            mimeType: image.mimeType,
            size: image.size,
            sortOrder: index,
          })),
        },
      },
      include: this.collectionInclude(),
    });

    await this.eventsService.create({
      userId,
      type: CollectionEventType.AddedCollection,
      title: `添加收藏：${catalogItem.name}`,
      catalogItemId: catalogItem.id,
      collectionItemId: item.id,
      snapshot: this.snapshot(item),
    });

    return item;
  }

  async get(userId: string, id: string) {
    const item = await this.prisma.collectionItem.findUnique({
      where: { id },
      include: this.collectionInclude(),
    });
    this.assertOwned(item, userId);
    return item;
  }

  async update(userId: string, id: string, dto: UpdateCollectionDto) {
    const current = await this.get(userId, id);
    const images = dto.images ?? [];

    const item = await this.prisma.$transaction(async (tx) => {
      if (dto.images) {
        await tx.collectionImage.deleteMany({ where: { collectionItemId: id } });
      }

      return tx.collectionItem.update({
        where: { id },
        data: {
          catalogItemId: dto.catalogItemId ?? undefined,
          purchasePrice: dto.purchasePrice ?? null,
          purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : null,
          purchaseChannel: dto.purchaseChannel || null,
          condition: dto.condition,
          status: dto.status,
          estimatedPrice: dto.estimatedPrice ?? null,
          note: dto.note || null,
          images: dto.images
            ? {
                create: images.map((image, index) => ({
                  url: image.url,
                  objectKey: image.objectKey,
                  provider: image.provider ?? 'aliyun-oss',
                  mimeType: image.mimeType,
                  size: image.size,
                  sortOrder: index,
                })),
              }
            : undefined,
        },
        include: this.collectionInclude(),
      });
    });

    await this.eventsService.create({
      userId,
      type: CollectionEventType.InfoEdited,
      title: `编辑收藏：${item.catalogItem.name}`,
      catalogItemId: item.catalogItemId,
      collectionItemId: item.id,
      snapshot: this.snapshot({ before: current, after: item }),
    });

    return item;
  }

  async updateStatus(userId: string, id: string, status: CollectionStatus) {
    const current = await this.get(userId, id);
    const item = await this.prisma.collectionItem.update({
      where: { id },
      data: { status },
      include: this.collectionInclude(),
    });

    await this.eventsService.create({
      userId,
      type:
        status === CollectionStatus.Sold
          ? CollectionEventType.Sold
          : CollectionEventType.StatusChanged,
      title: `状态变更：${current.status} -> ${status}`,
      catalogItemId: item.catalogItemId,
      collectionItemId: item.id,
      snapshot: this.snapshot(item),
    });

    return item;
  }

  async remove(userId: string, id: string) {
    const item = await this.get(userId, id);
    await this.eventsService.create({
      userId,
      type: CollectionEventType.Deleted,
      title: `删除收藏：${item.catalogItem.name}`,
      catalogItemId: item.catalogItemId,
      collectionItemId: item.id,
      snapshot: this.snapshot(item),
    });
    await this.prisma.collectionItem.delete({ where: { id } });
    return { ok: true };
  }

  private assertOwned<T extends { userId: string } | null>(
    item: T,
    userId: string,
  ): asserts item is T & { userId: string } {
    if (!item) {
      throw new NotFoundException('收藏不存在');
    }
    if (item.userId !== userId) {
      throw new ForbiddenException('只能操作自己的收藏');
    }
  }

  private collectionInclude() {
    return {
      images: { orderBy: { sortOrder: 'asc' as const } },
      catalogItem: {
        include: {
          images: { orderBy: { sortOrder: 'asc' as const } },
          priceRecords: { orderBy: { recordDate: 'desc' as const }, take: 1 },
        },
      },
    };
  }

  private snapshot(value: unknown): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }
}
