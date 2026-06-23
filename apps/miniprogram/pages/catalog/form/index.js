"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = require("../../../shared/api/request");
const auth_1 = require("../../../shared/auth");
const utils_1 = require("../../../shared/utils");
Page({
    data: {
        id: '',
        isEdit: false,
        canEdit: true,
        form: {
            name: '',
            characterName: '',
            series: '',
            model: '',
            releaseDate: '',
            officialPrice: '',
            tags: '',
            description: '',
            images: [],
        },
        saving: false,
    },
    onLoad(options) {
        const id = options.id ?? '';
        this.setData({ id, isEdit: Boolean(id) });
        if (id)
            this.loadItem(id);
    },
    onShow() {
        (0, auth_1.ensureAuthenticated)();
    },
    async loadItem(id) {
        try {
            const item = await (0, request_1.request)({ url: `/catalog/${id}` });
            const canEdit = (0, utils_1.canManageCatalogItem)(item, getApp().globalData.user);
            this.setData({
                canEdit,
                form: {
                    name: item.name,
                    characterName: item.characterName,
                    series: item.series ?? '',
                    model: item.model ?? '',
                    releaseDate: (0, utils_1.dateValue)(item.releaseDate),
                    officialPrice: item.officialPrice ? String(item.officialPrice) : '',
                    tags: item.tags?.join('，') ?? '',
                    description: item.description ?? '',
                    images: (0, utils_1.toUploadedImages)(item.images),
                },
            });
        }
        catch {
            wx.showToast({ title: '读取图鉴失败', icon: 'none' });
        }
    },
    onInput(event) {
        this.setData({ [`form.${event.currentTarget.dataset.field}`]: event.detail.value });
    },
    onDateChange(event) {
        this.setData({ 'form.releaseDate': event.detail.value });
    },
    onImagesChange(event) {
        this.setData({ 'form.images': event.detail.value });
    },
    async submit() {
        const form = this.data.form;
        if (!form.name.trim()) {
            wx.showToast({ title: '名称不能为空', icon: 'none' });
            return;
        }
        if (!form.characterName.trim()) {
            wx.showToast({ title: '角色不能为空', icon: 'none' });
            return;
        }
        this.setData({ saving: true });
        try {
            const payload = {
                name: form.name,
                characterName: form.characterName,
                series: form.series,
                model: form.model,
                releaseDate: (0, utils_1.toIsoDate)(form.releaseDate),
                officialPrice: form.officialPrice ? Number(form.officialPrice) : undefined,
                tags: (0, utils_1.splitTags)(form.tags),
                description: form.description,
                images: form.images,
                coverImage: form.images[0]?.url,
            };
            const item = this.data.isEdit
                ? await (0, request_1.request)({ url: `/catalog/${this.data.id}`, method: 'PATCH', data: payload })
                : await (0, request_1.request)({ url: '/catalog', method: 'POST', data: payload });
            wx.showToast({ title: this.data.isEdit ? '图鉴已保存' : '图鉴已创建' });
            wx.redirectTo({ url: `/pages/catalog/detail/index?id=${item.id}` });
        }
        catch (error) {
            wx.showToast({ title: (0, utils_1.apiErrorMessage)(error, '保存失败'), icon: 'none' });
        }
        finally {
            this.setData({ saving: false });
        }
    },
});
