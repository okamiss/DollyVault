import { Injectable } from '@nestjs/common';
import { CollectionEventType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string, collectionItemId?: string) {
    return this.prisma.collectionEvent.findMany({
      where: {
        userId,
        ...(collectionItemId ? { collectionItemId } : {}),
      },
      include: {
        catalogItem: true,
        collectionItem: {
          include: {
            catalogItem: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  create(input: {
    userId: string;
    type: CollectionEventType;
    title: string;
    catalogItemId?: string | null;
    collectionItemId?: string | null;
    snapshot?: Prisma.InputJsonValue;
  }) {
    return this.prisma.collectionEvent.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        catalogItemId: input.catalogItemId ?? undefined,
        collectionItemId: input.collectionItemId ?? undefined,
        snapshot: input.snapshot ?? undefined,
      },
    });
  }
}
