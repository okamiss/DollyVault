"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chooseAndUploadImages = chooseAndUploadImages;
const config_1 = require("../config");
const auth_1 = require("../auth");
function chooseAndUploadImages(current = [], max = 5) {
    const remaining = Math.max(0, max - current.length);
    if (remaining === 0) {
        wx.showToast({ title: `最多上传 ${max} 张`, icon: 'none' });
        return Promise.resolve(current);
    }
    return new Promise((resolve, reject) => {
        wx.chooseMedia({
            count: remaining,
            mediaType: ['image'],
            sourceType: ['album', 'camera'],
            success: async (chooseRes) => {
                try {
                    const uploaded = [];
                    for (const file of chooseRes.tempFiles) {
                        uploaded.push(...await uploadOne(file.tempFilePath));
                    }
                    resolve([...current, ...uploaded].slice(0, max));
                }
                catch (error) {
                    reject(error);
                }
            },
            fail: reject,
        });
    });
}
function uploadOne(filePath) {
    const token = (0, auth_1.getToken)();
    return new Promise((resolve, reject) => {
        wx.uploadFile({
            url: `${config_1.API_BASE_URL}/uploads/images`,
            filePath,
            name: 'files',
            header: token ? { Authorization: `Bearer ${token}` } : {},
            success(res) {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const parsed = JSON.parse(res.data);
                        resolve(parsed.items ?? []);
                    }
                    catch (error) {
                        reject(error);
                    }
                    return;
                }
                reject({ statusCode: res.statusCode, message: res.data });
            },
            fail: reject,
        });
    });
}
