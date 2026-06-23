"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getToken = getToken;
exports.getStoredAuth = getStoredAuth;
exports.setStoredAuth = setStoredAuth;
exports.setStoredUser = setStoredUser;
exports.clearAuth = clearAuth;
exports.ensureAuthenticated = ensureAuthenticated;
const TOKEN_KEY = 'dollyvault-token';
const USER_KEY = 'dollyvault-user';
function getToken() {
    return wx.getStorageSync(TOKEN_KEY) || null;
}
function getStoredAuth() {
    return {
        token: getToken(),
        user: wx.getStorageSync(USER_KEY) || null,
    };
}
function setStoredAuth(token, user) {
    wx.setStorageSync(TOKEN_KEY, token);
    wx.setStorageSync(USER_KEY, user);
}
function setStoredUser(user) {
    wx.setStorageSync(USER_KEY, user);
}
function clearAuth() {
    wx.removeStorageSync(TOKEN_KEY);
    wx.removeStorageSync(USER_KEY);
}
function ensureAuthenticated() {
    if (!getToken()) {
        wx.reLaunch({ url: '/pages/auth/login/index' });
        return false;
    }
    return true;
}
