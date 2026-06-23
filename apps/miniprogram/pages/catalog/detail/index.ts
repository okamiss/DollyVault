import { request } from '../../../shared/api/request';
import { ensureAuthenticated } from '../../../shared/auth';
import { conditionOptions, collectionStatusOptions } from '../../../shared/constants';
import { apiErrorMessage, canManageCatalogItem, dateText, money, toIsoDate } from '../../../shared/utils';
import type { CatalogItem, CollectionCondition, CollectionStatus, PriceRecord, UploadedImage } from '../../../shared/types';

interface PriceRecordView extends PriceRecord {
  priceText: string;
  recordDateText: string;
}

Page({
  data: {
    id: '',
    item: null as CatalogItem | null,
    gallery: [] as UploadedImage[],
    releaseDateText: '',
    officialPriceText: '',
    descriptionText: '',
    priceRecords: [] as PriceRecordView[],
    canManage: false,
    price: '',
    priceSource: '',
    priceNote: '',
    showAddForm: false,
    addForm: {
      purchasePrice: '',
      purchaseDate: '',
      purchaseChannel: '',
      condition: 'Mint' as CollectionCondition,
      status: 'Holding' as CollectionStatus,
      estimatedPrice: '',
      note: '',
      images: [] as UploadedImage[],
    },
    conditionOptions,
    collectionStatusOptions,
    conditionIndex: 0,
    statusIndex: 0,
  },

  onLoad(options: { id?: string }) {
    this.setData({ id: options.id ?? '' });
  },

  onShow() {
    if (!ensureAuthenticated()) return;
    this.loadItem();
  },

  async loadItem() {
    if (!this.data.id) return;
    try {
      const item = await request<CatalogItem>({ url: `/catalog/${this.data.id}` });
      const gallery = item.images?.length ? item.images : item.coverImage ? [{ url: item.coverImage, objectKey: item.coverImage }] : [];
      this.setData({
        item,
        gallery,
        releaseDateText: dateText(item.releaseDate),
        officialPriceText: item.officialPrice ? money(item.officialPrice) : '未记录',
        descriptionText: item.description || '暂无简介',
        priceRecords: (item.priceRecords ?? []).map((record) => ({
          ...record,
          priceText: money(record.price),
          recordDateText: dateText(record.recordDate),
        })),
        canManage: canManageCatalogItem(item, getApp().globalData.user),
      });
    } catch {
      wx.showToast({ title: '读取图鉴失败', icon: 'none' });
    }
  },

  previewImage(event: { currentTarget: { dataset: { url: string } } }) {
    const urls = this.data.gallery.map((image) => image.url);
    wx.previewImage({ current: event.currentTarget.dataset.url, urls });
  },

  goEdit() {
    wx.navigateTo({ url: `/pages/catalog/form/index?id=${this.data.id}` });
  },

  deleteItem() {
    wx.showModal({
      title: '确认删除这条图鉴？',
      content: '删除后无法恢复。已被收藏使用的图鉴不能删除。',
      confirmText: '删除',
      confirmColor: '#d4380d',
      success: async (res: { confirm: boolean }) => {
        if (!res.confirm) return;
        try {
          await request({ url: `/catalog/${this.data.id}`, method: 'DELETE' });
          wx.showToast({ title: '图鉴已删除' });
          wx.navigateBack();
        } catch (error) {
          wx.showToast({ title: apiErrorMessage(error, '删除失败'), icon: 'none' });
        }
      },
    });
  },

  onPriceInput(event: { currentTarget: { dataset: { field: string } }; detail: { value: string } }) {
    this.setData({ [event.currentTarget.dataset.field]: event.detail.value });
  },

  async submitPrice() {
    const price = Number(this.data.price);
    if (!Number.isFinite(price) || price < 0) {
      wx.showToast({ title: '请输入价格', icon: 'none' });
      return;
    }
    try {
      await request({
        url: '/price-records',
        method: 'POST',
        data: {
          catalogItemId: this.data.id,
          price,
          source: this.data.priceSource,
          note: this.data.priceNote,
        },
      });
      wx.showToast({ title: '价格已记录' });
      this.setData({ price: '', priceSource: '', priceNote: '' });
      this.loadItem();
    } catch (error) {
      wx.showToast({ title: apiErrorMessage(error, '保存失败'), icon: 'none' });
    }
  },

  toggleAddForm() {
    this.setData({ showAddForm: !this.data.showAddForm });
  },

  onAddInput(event: { currentTarget: { dataset: { field: string } }; detail: { value: string } }) {
    this.setData({ [`addForm.${event.currentTarget.dataset.field}`]: event.detail.value });
  },

  onAddDate(event: { detail: { value: string } }) {
    this.setData({ 'addForm.purchaseDate': event.detail.value });
  },

  onConditionChange(event: { detail: { value: string } }) {
    const index = Number(event.detail.value);
    this.setData({ conditionIndex: index, 'addForm.condition': conditionOptions[index].value });
  },

  onStatusChange(event: { detail: { value: string } }) {
    const index = Number(event.detail.value);
    this.setData({ statusIndex: index, 'addForm.status': collectionStatusOptions[index].value });
  },

  onImagesChange(event: { detail: { value: UploadedImage[] } }) {
    this.setData({ 'addForm.images': event.detail.value });
  },

  async submitCollection() {
    const form = this.data.addForm;
    try {
      await request({
        url: '/collections',
        method: 'POST',
        data: {
          catalogItemId: this.data.id,
          purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : undefined,
          purchaseDate: toIsoDate(form.purchaseDate),
          purchaseChannel: form.purchaseChannel,
          condition: form.condition,
          status: form.status,
          estimatedPrice: form.estimatedPrice ? Number(form.estimatedPrice) : undefined,
          note: form.note,
          images: form.images,
        },
      });
      wx.showToast({ title: '已保存到我的收藏' });
      this.setData({ showAddForm: false });
    } catch (error) {
      wx.showToast({ title: apiErrorMessage(error, '保存失败'), icon: 'none' });
    }
  },

  dateText,
  money,
});
