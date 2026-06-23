"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const upload_1 = require("../../shared/api/upload");
Component({
    properties: {
        value: {
            type: Array,
            value: [],
        },
        max: {
            type: Number,
            value: 5,
        },
    },
    methods: {
        async choose() {
            try {
                wx.showLoading({ title: '上传中' });
                const images = await (0, upload_1.chooseAndUploadImages)(this.properties.value, this.properties.max);
                this.triggerEvent('change', { value: images });
            }
            catch {
                wx.showToast({ title: '图片上传失败', icon: 'none' });
            }
            finally {
                wx.hideLoading();
            }
        },
        remove(event) {
            const images = [...this.properties.value];
            images.splice(Number(event.currentTarget.dataset.index), 1);
            this.triggerEvent('change', { value: images });
        },
        preview(event) {
            const urls = this.properties.value.map((image) => image.url);
            wx.previewImage({ current: event.currentTarget.dataset.url, urls });
        },
    },
});
