"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = request;
const config_1 = require("../config");
const auth_1 = require("../auth");
function buildUrl(path, params) {
    const base = path.startsWith('http') ? path : `${config_1.API_BASE_URL}${path}`;
    const query = Object.entries(params ?? {})
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');
    return query ? `${base}${base.includes('?') ? '&' : '?'}${query}` : base;
}
function request(options) {
    const token = (0, auth_1.getToken)();
    return new Promise((resolve, reject) => {
        wx.request({
            url: buildUrl(options.url, options.params),
            method: options.method ?? 'GET',
            data: options.data,
            header: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            success(res) {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(res.data);
                    return;
                }
                if (res.statusCode === 401 && !options.skipAuthRedirect) {
                    (0, auth_1.clearAuth)();
                    wx.reLaunch({ url: '/pages/auth/login/index' });
                }
                reject({ statusCode: res.statusCode, response: { data: res.data } });
            },
            fail(error) {
                reject(error);
            },
        });
    });
}
