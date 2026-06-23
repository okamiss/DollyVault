import { request } from '../../../shared/api/request';
import { ensureAuthenticated } from '../../../shared/auth';
import { canManageCatalogItem, itemImage, money } from '../../../shared/utils';
import type { CatalogItem } from '../../../shared/types';

interface CatalogView extends CatalogItem {
  imageUrl: string;
  officialPriceText: string;
}

Page({
  data: {
    search: '',
    owned: [] as CatalogView[],
    publicItems: [] as CatalogView[],
    loading: false,
  },

  onShow() {
    if (!ensureAuthenticated()) return;
    this.loadCatalog();
  },

  onSearchInput(event: { detail: { value: string } }) {
    this.setData({ search: event.detail.value });
  },

  submitSearch() {
    this.loadCatalog();
  },

  async loadCatalog() {
    this.setData({ loading: true });
    try {
      const catalog = await request<CatalogItem[]>({
        url: '/catalog',
        params: this.data.search ? { search: this.data.search.trim() } : {},
      });
      const user = getApp().globalData.user;
      const views = catalog.map((item) => ({
        ...item,
        imageUrl: itemImage(item),
        officialPriceText: item.officialPrice ? `官方价 ${money(item.officialPrice)}` : '未记录官方价',
      }));
      this.setData({
        owned: views.filter((item) => canManageCatalogItem(item, user)),
        publicItems: views.filter((item) => !canManageCatalogItem(item, user)),
      });
    } catch {
      wx.showToast({ title: '读取图鉴失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  goCreate() {
    wx.navigateTo({ url: '/pages/catalog/form/index' });
  },

  goDetail(event: { currentTarget: { dataset: { id: string } } }) {
    wx.navigateTo({ url: `/pages/catalog/detail/index?id=${event.currentTarget.dataset.id}` });
  },
});
