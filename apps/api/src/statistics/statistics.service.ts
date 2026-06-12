import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface DistributionRow {
  name: string;
  value: number;
}

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(userId: string) {
    const items = await this.prisma.collectionItem.findMany({
      where: { userId },
      include: {
        catalogItem: {
          include: {
            priceRecords: {
              orderBy: { recordDate: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { purchaseDate: 'asc' },
    });

    let purchaseTotal = 0;
    let estimatedTotal = 0;
    const byCharacter = new Map<string, number>();
    const bySeries = new Map<string, number>();
    const byStatus = new Map<string, number>();
    const monthlyPurchase = new Map<string, number>();
    const monthlyEstimated = new Map<string, number>();

    for (const item of items) {
      const purchasePrice = this.toNumber(item.purchasePrice);
      const estimatedPrice =
        this.toNumber(item.catalogItem.priceRecords[0]?.price) ??
        this.toNumber(item.estimatedPrice) ??
        purchasePrice ??
        0;

      purchaseTotal += purchasePrice ?? 0;
      estimatedTotal += estimatedPrice;

      this.increment(byCharacter, item.catalogItem.characterName || '未设置');
      this.increment(bySeries, item.catalogItem.series || '未设置');
      this.increment(byStatus, item.status);

      const month = this.monthKey(item.purchaseDate ?? item.createdAt);
      monthlyPurchase.set(month, (monthlyPurchase.get(month) ?? 0) + (purchasePrice ?? 0));
      monthlyEstimated.set(month, (monthlyEstimated.get(month) ?? 0) + estimatedPrice);
    }

    const floatAmount = estimatedTotal - purchaseTotal;
    const floatRatio = purchaseTotal > 0 ? floatAmount / purchaseTotal : 0;

    return {
      totalCount: items.length,
      purchaseTotal,
      estimatedTotal,
      floatAmount,
      floatRatio,
      byCharacter: this.mapToRows(byCharacter),
      bySeries: this.mapToRows(bySeries),
      byStatus: this.mapToRows(byStatus),
      monthlyPurchaseTrend: this.mapToTrend(monthlyPurchase),
      monthlyEstimatedTrend: this.mapToTrend(monthlyEstimated),
    };
  }

  private toNumber(value: Prisma.Decimal | number | null | undefined): number | null {
    if (value === null || value === undefined) {
      return null;
    }
    return typeof value === 'number' ? value : value.toNumber();
  }

  private increment(map: Map<string, number>, key: string) {
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  private mapToRows(map: Map<string, number>): DistributionRow[] {
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }

  private mapToTrend(map: Map<string, number>) {
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, value]) => ({ month, value }));
  }

  private monthKey(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
}
