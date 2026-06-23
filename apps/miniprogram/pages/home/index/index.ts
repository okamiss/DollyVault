import { request } from '../../../shared/api/request';
import { ensureAuthenticated } from '../../../shared/auth';
import { statusOptions } from '../../../shared/constants';
import { dateText, estimateFor, itemImage, money } from '../../../shared/utils';
import type { CollectionItem, CollectionStatus, Statistics } from '../../../shared/types';

interface CollectionView extends CollectionItem {
  imageUrl: string;
  estimateText: string;
  purchaseText: string;
  purchaseDateText: string;
}

Page({
  data: {
    statusOptions,
    selectedStatus: 'All' as CollectionStatus | 'All',
    collections: [] as CollectionView[],
    stats: null as Statistics | null,
    estimatedTotalText: '¥0.00',
    floatRatioText: '0.0',
    loading: false,
  },

  onShow() {
    if (!ensureAuthenticated()) return;
    this.loadData();
  },

  async loadData() {
    this.setData({ loading: true });
    try {
      const selectedStatus = this.data.selectedStatus;
      const [collections, stats] = await Promise.all([
        request<CollectionItem[]>({
          url: '/collections',
          params: selectedStatus === 'All' ? {} : { status: selectedStatus },
        }),
        request<Statistics>({ url: '/statistics' }),
      ]);
      this.setData({
        stats,
        estimatedTotalText: money(stats.estimatedTotal),
        floatRatioText: (stats.floatRatio * 100).toFixed(1),
        collections: collections.map(this.toCollectionView),
      });
    } catch {
      wx.showToast({ title: '读取收藏失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  toCollectionView(item: CollectionItem): CollectionView {
    return {
      ...item,
      imageUrl: itemImage(item),
      estimateText: money(estimateFor(item)),
      purchaseText: money(item.purchasePrice),
      purchaseDateText: dateText(item.purchaseDate),
    };
  },

  selectStatus(event: { currentTarget: { dataset: { value: CollectionStatus | 'All' } } }) {
    this.setData({ selectedStatus: event.currentTarget.dataset.value }, () => this.loadData());
  },

  goCatalog() {
    wx.switchTab({ url: '/pages/catalog/list/index' });
  },

  goCollection(event: { currentTarget: { dataset: { id: string } } }) {
    wx.navigateTo({ url: `/pages/collections/detail/index?id=${event.currentTarget.dataset.id}` });
  },
});
