import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CatalogStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCatalogDto, UpdateCatalogDto } from './dto/catalog.dto';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async list(search?: string) {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { characterName: { contains: search, mode: 'insensitive' as const } },
            { series: { contains: search, mode: 'insensitive' as const } },
            { tags: { has: search } },
          ],
        }
      : {};

    const items = await this.prisma.catalogItem.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { collections: true, priceRecords: true } },
      },
      orderBy: [
        { collections: { _count: 'desc' } },
        { createdAt: 'desc' },
      ],
      take: 100,
    });

    return items.map((item) => ({
      ...item,
      usageCount: item._count.collections,
    }));
  }

  async create(userId: string, dto: CreateCatalogDto) {
    const images = dto.images ?? [];
    return this.prisma.catalogItem.create({
      data: {
        name: dto.name.trim(),
        characterName: dto.characterName.trim(),
        series: dto.series?.trim() || null,
        model: dto.model?.trim() || null,
        releaseDate: dto.releaseDate ? new Date(dto.releaseDate) : null,
        officialPrice: dto.officialPrice ?? null,
        coverImage: dto.coverImage || images[0]?.url || null,
        tags: dto.tags ?? [],
        description: dto.description?.trim() || null,
        status: CatalogStatus.Approved,
        createdById: userId,
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
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async get(id: string) {
    const item = await this.prisma.catalogItem.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        priceRecords: { orderBy: { recordDate: 'desc' }, take: 20 },
        collections: {
          include: { images: { orderBy: { sortOrder: 'asc' } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!item) {
      throw new NotFoundException('图鉴不存在');
    }
    return item;
  }

  async update(userId: string, id: string, dto: UpdateCatalogDto) {
    await this.ensureOwned(id, userId);
    const images = dto.images ?? [];

    return this.prisma.$transaction(async (tx) => {
      if (dto.images) {
        await tx.catalogImage.deleteMany({ where: { catalogItemId: id } });
      }

      return tx.catalogItem.update({
        where: { id },
        data: {
          name: dto.name?.trim(),
          characterName: dto.characterName?.trim(),
          series: dto.series?.trim() || null,
          model: dto.model?.trim() || null,
          releaseDate: dto.releaseDate ? new Date(dto.releaseDate) : null,
          officialPrice: dto.officialPrice ?? null,
          coverImage: dto.coverImage || images[0]?.url || undefined,
          tags: dto.tags,
          description: dto.description?.trim() || null,
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
        include: { images: { orderBy: { sortOrder: 'asc' } } },
      });
    });
  }

  async remove(userId: string, id: string) {
    await this.ensureOwned(id, userId);
    const usageCount = await this.prisma.collectionItem.count({
      where: { catalogItemId: id },
    });
    if (usageCount > 0) {
      throw new BadRequestException('已有收藏使用这条图鉴，不能删除');
    }
    await this.prisma.catalogItem.delete({ where: { id } });
    return { ok: true };
  }

  private async ensureExists(id: string) {
    const item = await this.prisma.catalogItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('图鉴不存在');
    }
    return item;
  }

  private async ensureOwned(id: string, userId: string) {
    const item = await this.ensureExists(id);
    if (item.createdById !== userId) {
      throw new ForbiddenException('只能操作自己创建的图鉴');
    }
    return item;
  }
}
