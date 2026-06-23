"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = require("../../../shared/api/request");
const auth_1 = require("../../../shared/auth");
const utils_1 = require("../../../shared/utils");
Page({
    data: {
        username: '',
        password: '',
        loading: false,
    },
    onUsernameInput(event) {
        this.setData({ username: event.detail.value });
    },
    onPasswordInput(event) {
        this.setData({ password: event.detail.value });
    },
    goRegister() {
        wx.navigateTo({ url: '/pages/auth/register/index' });
    },
    async submit() {
        const username = this.data.username.trim();
        const password = this.data.password;
        if (!/^[A-Za-z0-9_]{4,20}$/.test(username)) {
            wx.showToast({ title: '用户名只能包含英文、数字、下划线，长度 4-20 位', icon: 'none' });
            return;
        }
        if (!password) {
            wx.showToast({ title: '请输入密码', icon: 'none' });
            return;
        }
        this.setData({ loading: true });
        try {
            const data = await (0, request_1.request)({
                url: '/auth/login',
                method: 'POST',
                data: { username, password },
                skipAuthRedirect: true,
            });
            (0, auth_1.setStoredAuth)(data.accessToken, data.user);
            getApp().globalData.user = data.user;
            wx.switchTab({ url: '/pages/home/index/index' });
        }
        catch (error) {
            wx.showToast({ title: (0, utils_1.apiErrorMessage)(error, '登录失败'), icon: 'none' });
        }
        finally {
            this.setData({ loading: false });
        }
    },
});
