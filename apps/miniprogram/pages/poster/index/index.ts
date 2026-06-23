import { request } from '../../../shared/api/request';
import { ensureAuthenticated } from '../../../shared/auth';
import { posterTemplates } from '../../../shared/constants';
import { estimateFor, itemImage, money } from '../../../shared/utils';
import type { CollectionItem, PosterTemplate } from '../../../shared/types';

Page({
  data: {
    collections: [] as CollectionItem[],
    collectionNames: [] as string[],
    collectionIndex: 0,
    templates: posterTemplates as unknown as PosterTemplate[],
    templateNames: posterTemplates.map((item) => item.name),
    templateIndex: 0,
    selected: null as CollectionItem | null,
    imageUrl: '',
    estimateText: '',
    floatText: '',
  },

  onShow() {
    if (!ensureAuthenticated()) return;
    this.loadData();
  },

  async loadData() {
    try {
      const [collections, templates] = await Promise.all([
        request<CollectionItem[]>({ url: '/collections' }),
        request<PosterTemplate[]>({ url: '/posters/templates' }).catch(() => posterTemplates as unknown as PosterTemplate[]),
      ]);
      this.setData({
        collections,
        collectionNames: collections.map((item) => item.catalogItem.name),
        templates: templates.length ? templates : (posterTemplates as unknown as PosterTemplate[]),
        templateNames: (templates.length ? templates : posterTemplates).map((item) => item.name),
      });
      this.applySelection(0);
    } catch {
      wx.showToast({ title: '读取海报数据失败', icon: 'none' });
    }
  },

  onCollectionChange(event: { detail: { value: string } }) {
    this.applySelection(Number(event.detail.value));
  },

  onTemplateChange(event: { detail: { value: string } }) {
    this.setData({ templateIndex: Number(event.detail.value) }, () => this.drawPoster());
  },

  applySelection(index: number) {
    const selected = this.data.collections[index] ?? null;
    const estimate = selected ? Number(estimateFor(selected)) : 0;
    const purchase = selected ? Number(selected.purchasePrice ?? 0) : 0;
    this.setData({
      collectionIndex: index,
      selected,
      imageUrl: itemImage(selected),
      estimateText: money(estimate),
      floatText: `${estimate >= purchase ? '+' : ''}${money(estimate - purchase)}`,
    }, () => this.drawPoster());
  },

  drawPoster() {
    const selected = this.data.selected;
    if (!selected) return;
    const template = this.data.templates[this.data.templateIndex]?.key ?? 'Minimal';
    const query = wx.createSelectorQuery();
    query.select('#posterCanvas').fields({ node: true, size: true }).exec((res: any[]) => {
      const canvas = res?.[0]?.node;
      if (!canvas) return;
      const width = res[0].width;
      const height = res[0].height;
      const dpr = wx.getSystemInfoSync().pixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      const drawBackground = () => {
        ctx.fillStyle = template === 'CollectionCard' ? '#18243a' : template === 'CutePink' ? '#fff0f6' : template === 'Vintage' ? '#fff8ef' : '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = template === 'CollectionCard' ? '#2a3650' : '#fff7fb';
        roundRect(ctx, 42, 92, width - 84, width - 84, 18);
        ctx.fill();
      };
      const drawText = () => {
        ctx.fillStyle = template === 'CollectionCard' ? '#ffffff' : '#18243a';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('My Collection', 28, 42);
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(selected.catalogItem.name.slice(0, 14), 28, height - 150);
        ctx.font = '14px sans-serif';
        ctx.fillText(`${selected.catalogItem.characterName} · ${selected.catalogItem.series || 'DollyVault'}`.slice(0, 24), 28, height - 116);
        ctx.fillStyle = '#ff5c9a';
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText(this.data.estimateText, 28, height - 72);
        ctx.font = '14px sans-serif';
        ctx.fillText(this.data.floatText, 28, height - 46);
        ctx.fillStyle = template === 'CollectionCard' ? '#ffffff' : '#ff5c9a';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('DollyVault', width - 118, height - 28);
      };

      drawBackground();
      if (!this.data.imageUrl) {
        drawText();
        return;
      }
      wx.getImageInfo({
        src: this.data.imageUrl,
        success: (imageInfo: { path: string }) => {
          const image = canvas.createImage();
          image.onload = () => {
            ctx.drawImage(image, 52, 102, width - 104, width - 104);
            drawText();
          };
          image.onerror = drawText;
          image.src = imageInfo.path;
        },
        fail: drawText,
      });
    });
  },

  savePoster() {
    const query = wx.createSelectorQuery();
    query.select('#posterCanvas').fields({ node: true }).exec((res: any[]) => {
      const canvas = res?.[0]?.node;
      if (!canvas) return;
      wx.canvasToTempFilePath({
        canvas,
        success: (fileRes: { tempFilePath: string }) => {
          wx.saveImageToPhotosAlbum({
            filePath: fileRes.tempFilePath,
            success: () => wx.showToast({ title: '海报已保存' }),
            fail: () => wx.showToast({ title: '保存失败，请检查相册权限', icon: 'none' }),
          });
        },
      });
    });
  },
});

function roundRect(ctx: any, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}
