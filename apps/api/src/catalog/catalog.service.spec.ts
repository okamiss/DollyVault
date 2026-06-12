import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { CatalogService } from './catalog.service';

function createService(existingItem: { id: string; createdById: string }) {
  const prisma = {
    catalogItem: {
      findUnique: vi.fn().mockResolvedValue(existingItem),
      findMany: vi.fn(),
      update: vi.fn().mockResolvedValue(existingItem),
      delete: vi.fn().mockResolvedValue(existingItem),
    },
    collectionItem: {
      count: vi.fn().mockResolvedValue(0),
    },
    catalogImage: {
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(async (callback) => callback(prisma)),
  };

  return {
    prisma,
    service: new CatalogService(prisma as any),
  };
}

describe('CatalogService ownership', () => {
  it('rejects updates from users who did not create the catalog item', async () => {
    const { service } = createService({ id: 'catalog-1', createdById: 'owner-user' });

    await expect(
      service.update('other-user', 'catalog-1', { name: 'New name' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects deletes from users who did not create the catalog item', async () => {
    const { service } = createService({ id: 'catalog-1', createdById: 'owner-user' });

    await expect(service.remove('other-user', 'catalog-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('rejects deletes when the catalog item is used by collections', async () => {
    const { prisma, service } = createService({
      id: 'catalog-1',
      createdById: 'owner-user',
    });
    prisma.collectionItem.count.mockResolvedValue(2);

    await expect(service.remove('owner-user', 'catalog-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.catalogItem.delete).not.toHaveBeenCalled();
  });

  it('allows creators to update their own catalog item', async () => {
    const { prisma, service } = createService({
      id: 'catalog-1',
      createdById: 'owner-user',
    });

    await service.update('owner-user', 'catalog-1', { name: 'Updated name' });

    expect(prisma.catalogItem.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'catalog-1' } }),
    );
  });
});

describe('CatalogService list', () => {
  it('sorts catalog items by usage count and exposes usageCount', async () => {
    const { prisma, service } = createService({
      id: 'catalog-1',
      createdById: 'owner-user',
    });
    prisma.catalogItem.findMany.mockResolvedValue([
      { id: 'popular', _count: { collections: 5, priceRecords: 1 } },
      { id: 'unused', _count: { collections: 0, priceRecords: 0 } },
    ]);

    await expect(service.list()).resolves.toEqual([
      { id: 'popular', _count: { collections: 5, priceRecords: 1 }, usageCount: 5 },
      { id: 'unused', _count: { collections: 0, priceRecords: 0 }, usageCount: 0 },
    ]);
    expect(prisma.catalogItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [
          { collections: { _count: 'desc' } },
          { createdAt: 'desc' },
        ],
      }),
    );
  });
});
