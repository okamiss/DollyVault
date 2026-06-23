import { getStoredAuth, clearAuth, setStoredUser } from './shared/auth';
import { request } from './shared/api/request';
import type { CurrentUser } from './shared/types';

App({
  globalData: {
    user: null as CurrentUser | null,
  },

  onLaunch() {
    const auth = getStoredAuth();
    this.globalData.user = auth.user;
    if (auth.token) {
      this.refreshCurrentUser();
    }
  },

  async refreshCurrentUser() {
    try {
      const user = await request<CurrentUser>({ url: '/auth/me' });
      setStoredUser(user);
      this.globalData.user = user;
    } catch {
      clearAuth();
      this.globalData.user = null;
    }
  },
});
