import { request } from '../../../shared/api/request';
import { clearAuth, ensureAuthenticated, setStoredUser } from '../../../shared/auth';
import { apiErrorMessage } from '../../../shared/utils';
import type { CurrentUser, Setting } from '../../../shared/types';

Page({
  data: {
    user: null as CurrentUser | null,
    settings: null as Setting | null,
    profile: {
      nickname: '',
      avatarUrl: '',
      bio: '',
    },
  },

  onShow() {
    if (!ensureAuthenticated()) return;
    this.loadData();
  },

  async loadData() {
    try {
      const [user, settings] = await Promise.all([
        request<CurrentUser>({ url: '/auth/me' }),
        request<Setting>({ url: '/settings' }),
      ]);
      setStoredUser(user);
      getApp().globalData.user = user;
      this.setData({
        user,
        settings,
        profile: {
          nickname: user.nickname ?? '',
          avatarUrl: user.avatarUrl ?? '',
          bio: user.bio ?? '',
        },
      });
    } catch {
      wx.showToast({ title: '读取账号失败', icon: 'none' });
    }
  },

  onProfileInput(event: { currentTarget: { dataset: { field: string } }; detail: { value: string } }) {
    this.setData({ [`profile.${event.currentTarget.dataset.field}`]: event.detail.value });
  },

  async saveProfile() {
    try {
      const user = await request<CurrentUser>({
        url: '/users/me',
        method: 'PATCH',
        data: this.data.profile,
      });
      setStoredUser(user);
      getApp().globalData.user = user;
      wx.showToast({ title: '账号信息已保存' });
    } catch (error) {
      wx.showToast({ title: apiErrorMessage(error, '保存失败'), icon: 'none' });
    }
  },

  async toggleSetting(event: { currentTarget: { dataset: { field: keyof Setting } } }) {
    const field = event.currentTarget.dataset.field;
    const settings = this.data.settings;
    if (!settings) return;
    const nextValue = !settings[field];
    try {
      const next = await request<Setting>({
        url: '/settings',
        method: 'PATCH',
        data: { [field]: nextValue },
      });
      this.setData({ settings: next });
    } catch {
      wx.showToast({ title: '偏好保存失败', icon: 'none' });
    }
  },

  async exportJson(event: { currentTarget: { dataset: { url: string; name: string } } }) {
    try {
      const data = await request<Record<string, unknown>[]>({ url: event.currentTarget.dataset.url });
      wx.setClipboardData({
        data: JSON.stringify(data, null, 2),
        success: () => wx.showToast({ title: `${event.currentTarget.dataset.name} 已复制` }),
      });
    } catch {
      wx.showToast({ title: '导出失败', icon: 'none' });
    }
  },

  importData() {
    wx.showToast({ title: '导入写入将在下一阶段开放', icon: 'none' });
  },

  goGuide() {
    wx.switchTab({ url: '/pages/catalog/list/index' });
  },

  about() {
    wx.showModal({ title: '关于 DollyVault', content: 'DollyVault v0.1.0' });
  },

  logout() {
    clearAuth();
    getApp().globalData.user = null;
    wx.reLaunch({ url: '/pages/auth/login/index' });
  },
});
