import { request } from '../../../shared/api/request';
import { ensureAuthenticated } from '../../../shared/auth';
import { apiErrorMessage, canManageCatalogItem, dateValue, splitTags, toIsoDate, toUploadedImages } from '../../../shared/utils';
import type { CatalogItem, UploadedImage } from '../../../shared/types';

Page({
  data: {
    id: '',
    isEdit: false,
    canEdit: true,
    form: {
      name: '',
      characterName: '',
      series: '',
      model: '',
      releaseDate: '',
      officialPrice: '',
      tags: '',
      description: '',
      images: [] as UploadedImage[],
    },
    saving: false,
  },

  onLoad(options: { id?: string }) {
    const id = options.id ?? '';
    this.setData({ id, isEdit: Boolean(id) });
    if (id) this.loadItem(id);
  },

  onShow() {
    ensureAuthenticated();
  },

  async loadItem(id: string) {
    try {
      const item = await request<CatalogItem>({ url: `/catalog/${id}` });
      const canEdit = canManageCatalogItem(item, getApp().globalData.user);
      this.setData({
        canEdit,
        form: {
          name: item.name,
          characterName: item.characterName,
          series: item.series ?? '',
          model: item.model ?? '',
          releaseDate: dateValue(item.releaseDate),
          officialPrice: item.officialPrice ? String(item.officialPrice) : '',
          tags: item.tags?.join('，') ?? '',
          description: item.description ?? '',
          images: toUploadedImages(item.images),
        },
      });
    } catch {
      wx.showToast({ title: '读取图鉴失败', icon: 'none' });
    }
  },

  onInput(event: { currentTarget: { dataset: { field: string } }; detail: { value: string } }) {
    this.setData({ [`form.${event.currentTarget.dataset.field}`]: event.detail.value });
  },

  onDateChange(event: { detail: { value: string } }) {
    this.setData({ 'form.releaseDate': event.detail.value });
  },

  onImagesChange(event: { detail: { value: UploadedImage[] } }) {
    this.setData({ 'form.images': event.detail.value });
  },

  async submit() {
    const form = this.data.form;
    if (!form.name.trim()) {
      wx.showToast({ title: '名称不能为空', icon: 'none' });
      return;
    }
    if (!form.characterName.trim()) {
      wx.showToast({ title: '角色不能为空', icon: 'none' });
      return;
    }
    this.setData({ saving: true });
    try {
      const payload = {
        name: form.name,
        characterName: form.characterName,
        series: form.series,
        model: form.model,
        releaseDate: toIsoDate(form.releaseDate),
        officialPrice: form.officialPrice ? Number(form.officialPrice) : undefined,
        tags: splitTags(form.tags),
        description: form.description,
        images: form.images,
        coverImage: form.images[0]?.url,
      };
      const item = this.data.isEdit
        ? await request<CatalogItem>({ url: `/catalog/${this.data.id}`, method: 'PATCH', data: payload })
        : await request<CatalogItem>({ url: '/catalog', method: 'POST', data: payload });
      wx.showToast({ title: this.data.isEdit ? '图鉴已保存' : '图鉴已创建' });
      wx.redirectTo({ url: `/pages/catalog/detail/index?id=${item.id}` });
    } catch (error) {
      wx.showToast({ title: apiErrorMessage(error, '保存失败'), icon: 'none' });
    } finally {
      this.setData({ saving: false });
    }
  },
});
