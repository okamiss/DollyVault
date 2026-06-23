"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = require("../../../shared/api/request");
const auth_1 = require("../../../shared/auth");
const utils_1 = require("../../../shared/utils");
Page({
    data: {
        user: null,
        settings: null,
        profile: {
            nickname: '',
            avatarUrl: '',
            bio: '',
        },
    },
    onShow() {
        if (!(0, auth_1.ensureAuthenticated)())
            return;
        this.loadData();
    },
    async loadData() {
        try {
            const [user, settings] = await Promise.all([
                (0, request_1.request)({ url: '/auth/me' }),
                (0, request_1.request)({ url: '/settings' }),
            ]);
            (0, auth_1.setStoredUser)(user);
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
        }
        catch {
            wx.showToast({ title: '读取账号失败', icon: 'none' });
        }
    },
    onProfileInput(event) {
        this.setData({ [`profile.${event.currentTarget.dataset.field}`]: event.detail.value });
    },
    async saveProfile() {
        try {
            const user = await (0, request_1.request)({
                url: '/users/me',
                method: 'PATCH',
                data: this.data.profile,
            });
            (0, auth_1.setStoredUser)(user);
            getApp().globalData.user = user;
            wx.showToast({ title: '账号信息已保存' });
        }
        catch (error) {
            wx.showToast({ title: (0, utils_1.apiErrorMessage)(error, '保存失败'), icon: 'none' });
        }
    },
    async toggleSetting(event) {
        const field = event.currentTarget.dataset.field;
        const settings = this.data.settings;
        if (!settings)
            return;
        const nextValue = !settings[field];
        try {
            const next = await (0, request_1.request)({
                url: '/settings',
                method: 'PATCH',
                data: { [field]: nextValue },
            });
            this.setData({ settings: next });
        }
        catch {
            wx.showToast({ title: '偏好保存失败', icon: 'none' });
        }
    },
    async exportJson(event) {
        try {
            const data = await (0, request_1.request)({ url: event.currentTarget.dataset.url });
            wx.setClipboardData({
                data: JSON.stringify(data, null, 2),
                success: () => wx.showToast({ title: `${event.currentTarget.dataset.name} 已复制` }),
            });
        }
        catch {
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
        (0, auth_1.clearAuth)();
        getApp().globalData.user = null;
        wx.reLaunch({ url: '/pages/auth/login/index' });
    },
});
