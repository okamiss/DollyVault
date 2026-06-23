import { API_BASE_URL } from '../config';
import { clearAuth, getToken } from '../auth';

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface RequestOptions {
  url: string;
  method?: Method;
  data?: Record<string, unknown> | unknown[];
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuthRedirect?: boolean;
}

function buildUrl(path: string, params?: RequestOptions['params']) {
  const base = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const query = Object.entries(params ?? {})
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  return query ? `${base}${base.includes('?') ? '&' : '?'}${query}` : base;
}

export function request<T>(options: RequestOptions): Promise<T> {
  const token = getToken();
  return new Promise((resolve, reject) => {
    wx.request({
      url: buildUrl(options.url, options.params),
      method: options.method ?? 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      success(res: { statusCode: number; data: T | { message?: string | string[] } }) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as T);
          return;
        }
        if (res.statusCode === 401 && !options.skipAuthRedirect) {
          clearAuth();
          wx.reLaunch({ url: '/pages/auth/login/index' });
        }
        reject({ statusCode: res.statusCode, response: { data: res.data } });
      },
      fail(error: unknown) {
        reject(error);
      },
    });
  });
}
