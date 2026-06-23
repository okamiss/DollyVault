import { request } from '../../../shared/api/request';
import { setStoredAuth } from '../../../shared/auth';
import { apiErrorMessage } from '../../../shared/utils';
import type { AuthResponse } from '../../../shared/types';

Page({
  data: {
    username: '',
    nickname: '',
    password: '',
    confirm: '',
    loading: false,
  },

  onInput(event: { currentTarget: { dataset: { field: string } }; detail: { value: string } }) {
    this.setData({ [event.currentTarget.dataset.field]: event.detail.value });
  },

  goLogin() {
    wx.navigateBack();
  },

  async submit() {
    const { username, nickname, password, confirm } = this.data;
    const cleanUsername = username.trim();
    if (!/^[A-Za-z0-9_]{4,20}$/.test(cleanUsername)) {
      wx.showToast({ title: '用户名只能包含英文、数字、下划线，长度 4-20 位', icon: 'none' });
      return;
    }
    if (password.length < 6) {
      wx.showToast({ title: '密码至少需要 6 位', icon: 'none' });
      return;
    }
    if (password !== confirm) {
      wx.showToast({ title: '两次输入的密码不一致', icon: 'none' });
      return;
    }

    this.setData({ loading: true });
    try {
      const data = await request<AuthResponse>({
        url: '/auth/register',
        method: 'POST',
        data: { username: cleanUsername, nickname: nickname.trim() || undefined, password },
        skipAuthRedirect: true,
      });
      setStoredAuth(data.accessToken, data.user);
      getApp().globalData.user = data.user;
      wx.switchTab({ url: '/pages/home/index/index' });
    } catch (error) {
      wx.showToast({ title: apiErrorMessage(error, '注册失败'), icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },
});
