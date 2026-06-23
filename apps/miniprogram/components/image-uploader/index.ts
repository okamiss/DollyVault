import { chooseAndUploadImages } from '../../shared/api/upload';
import type { UploadedImage } from '../../shared/types';

Component({
  properties: {
    value: {
      type: Array,
      value: [],
    },
    max: {
      type: Number,
      value: 5,
    },
  },
  methods: {
    async choose(this: any) {
      try {
        wx.showLoading({ title: '上传中' });
        const images = await chooseAndUploadImages(this.properties.value as UploadedImage[], this.properties.max);
        this.triggerEvent('change', { value: images });
      } catch {
        wx.showToast({ title: '图片上传失败', icon: 'none' });
      } finally {
        wx.hideLoading();
      }
    },
    remove(this: any, event: { currentTarget: { dataset: { index: number } } }) {
      const images = [...(this.properties.value as UploadedImage[])];
      images.splice(Number(event.currentTarget.dataset.index), 1);
      this.triggerEvent('change', { value: images });
    },
    preview(this: any, event: { currentTarget: { dataset: { url: string } } }) {
      const urls = (this.properties.value as UploadedImage[]).map((image) => image.url);
      wx.previewImage({ current: event.currentTarget.dataset.url, urls });
    },
  },
});
