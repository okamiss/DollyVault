import { request } from '../../../shared/api/request';
import { ensureAuthenticated } from '../../../shared/auth';
import { dateText } from '../../../shared/utils';
import type { CollectionEvent } from '../../../shared/types';

interface EventView extends CollectionEvent {
  timeText: string;
  danger: boolean;
}

Page({
  data: {
    events: [] as EventView[],
  },

  onShow() {
    if (!ensureAuthenticated()) return;
    this.loadEvents();
  },

  async loadEvents() {
    try {
      const events = await request<CollectionEvent[]>({ url: '/events' });
      this.setData({
        events: events.map((event) => ({
          ...event,
          timeText: dateText(event.createdAt),
          danger: event.type === 'Deleted',
        })),
      });
    } catch {
      wx.showToast({ title: '读取历史失败', icon: 'none' });
    }
  },
});
