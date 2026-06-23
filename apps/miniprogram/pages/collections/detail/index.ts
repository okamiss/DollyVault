import { request } from '../../../shared/api/request';
import { ensureAuthenticated } from '../../../shared/auth';
import { conditionOptions, collectionStatusOptions } from '../../../shared/constants';
import { apiErrorMessage, dateText, dateValue, estimateFor, itemImage, money, toIsoDate } from '../../../shared/utils';
import type { CollectionCondition, CollectionItem, CollectionStatus, UploadedImage } from '../../../shared/types';

Page({
  data: {
    id: '',
    item: null as CollectionItem | null,
    imageUrl: '',
    estimateText: '',
    purchaseText: '',
    purchaseDateText: '',
    form: {
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
    saving: false,
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
      const item = await request<CollectionItem>({ url: `/collections/${this.data.id}` });
      const conditionIndex = Math.max(0, conditionOptions.findIndex((option) => option.value === item.condition));
      const statusIndex = Math.max(0, collectionStatusOptions.findIndex((option) => option.value === item.status));
      this.setData({
        item,
        imageUrl: itemImage(item),
        estimateText: money(estimateFor(item)),
        purchaseText: money(item.purchasePrice),
        purchaseDateText: dateText(item.purchaseDate),
        conditionIndex,
        statusIndex,
        form: {
          purchasePrice: item.purchasePrice ? String(item.purchasePrice) : '',
          purchaseDate: dateValue(item.purchaseDate),
          purchaseChannel: item.purchaseChannel ?? '',
          condition: item.condition,
          status: item.status,
          estimatedPrice: item.estimatedPrice ? String(item.estimatedPrice) : '',
          note: item.note ?? '',
          images: item.images ?? [],
        },
      });
    } catch {
      wx.showToast({ title: '读取收藏失败', icon: 'none' });
    }
  },

  onInput(event: { currentTarget: { dataset: { field: string } }; detail: { value: string } }) {
    this.setData({ [`form.${event.currentTarget.dataset.field}`]: event.detail.value });
  },

  onDate(event: { detail: { value: string } }) {
    this.setData({ 'form.purchaseDate': event.detail.value });
  },

  onConditionChange(event: { detail: { value: string } }) {
    const index = Number(event.detail.value);
    this.setData({ conditionIndex: index, 'form.condition': conditionOptions[index].value });
  },

  onStatusChange(event: { detail: { value: string } }) {
    const index = Number(event.detail.value);
    this.setData({ statusIndex: index, 'form.status': collectionStatusOptions[index].value });
  },

  onImagesChange(event: { detail: { value: UploadedImage[] } }) {
    this.setData({ 'form.images': event.detail.value });
  },

  async submit() {
    const form = this.data.form;
    this.setData({ saving: true });
    try {
      await request<CollectionItem>({
        url: `/collections/${this.data.id}`,
        method: 'PATCH',
        data: {
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
      wx.showToast({ title: '收藏已保存' });
      this.loadItem();
    } catch (error) {
      wx.showToast({ title: apiErrorMessage(error, '保存失败'), icon: 'none' });
    } finally {
      this.setData({ saving: false });
    }
  },

  deleteItem() {
    wx.showModal({
      title: '确认删除这条收藏？',
      confirmText: '删除',
      confirmColor: '#d4380d',
      success: async (res: { confirm: boolean }) => {
        if (!res.confirm) return;
        try {
          await request({ url: `/collections/${this.data.id}`, method: 'DELETE' });
          wx.showToast({ title: '收藏已删除' });
          wx.switchTab({ url: '/pages/home/index/index' });
        } catch (error) {
          wx.showToast({ title: apiErrorMessage(error, '删除失败'), icon: 'none' });
        }
      },
    });
  },
});
