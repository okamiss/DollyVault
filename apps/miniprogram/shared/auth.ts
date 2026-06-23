import type { CurrentUser } from './types';

const TOKEN_KEY = 'dollyvault-token';
const USER_KEY = 'dollyvault-user';

export function getToken(): string | null {
  return wx.getStorageSync(TOKEN_KEY) || null;
}

export function getStoredAuth(): { token: string | null; user: CurrentUser | null } {
  return {
    token: getToken(),
    user: wx.getStorageSync(USER_KEY) || null,
  };
}

export function setStoredAuth(token: string, user: CurrentUser) {
  wx.setStorageSync(TOKEN_KEY, token);
  wx.setStorageSync(USER_KEY, user);
}

export function setStoredUser(user: CurrentUser) {
  wx.setStorageSync(USER_KEY, user);
}

export function clearAuth() {
  wx.removeStorageSync(TOKEN_KEY);
  wx.removeStorageSync(USER_KEY);
}

export function ensureAuthenticated() {
  if (!getToken()) {
    wx.reLaunch({ url: '/pages/auth/login/index' });
    return false;
  }
  return true;
}
