"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = require("../../../shared/api/request");
const auth_1 = require("../../../shared/auth");
const constants_1 = require("../../../shared/constants");
const utils_1 = require("../../../shared/utils");
Page({
    data: {
        id: '',
        item: null,
        imageUrl: '',
        estimateText: '',
        purchaseText: '',
        purchaseDateText: '',
        form: {
            purchasePrice: '',
            purchaseDate: '',
            purchaseChannel: '',
            condition: 'Mint',
            status: 'Holding',
            estimatedPrice: '',
            note: '',
            images: [],
        },
        conditionOptions: constants_1.conditionOptions,
        collectionStatusOptions: constants_1.collectionStatusOptions,
        conditionIndex: 0,
        statusIndex: 0,
        saving: false,
    },
    onLoad(options) {
        this.setData({ id: options.id ?? '' });
    },
    onShow() {
        if (!(0, auth_1.ensureAuthenticated)())
            return;
        this.loadItem();
    },
    async loadItem() {
        if (!this.data.id)
            return;
        try {
            const item = await (0, request_1.request)({ url: `/collections/${this.data.id}` });
            const conditionIndex = Math.max(0, constants_1.conditionOptions.findIndex((option) => option.value === item.condition));
            const statusIndex = Math.max(0, constants_1.collectionStatusOptions.findIndex((option) => option.value === item.status));
            this.setData({
                item,
                imageUrl: (0, utils_1.itemImage)(item),
                estimateText: (0, utils_1.money)((0, utils_1.estimateFor)(item)),
                purchaseText: (0, utils_1.money)(item.purchasePrice),
                purchaseDateText: (0, utils_1.dateText)(item.purchaseDate),
                conditionIndex,
                statusIndex,
                form: {
                    purchasePrice: item.purchasePrice ? String(item.purchasePrice) : '',
                    purchaseDate: (0, utils_1.dateValue)(item.purchaseDate),
                    purchaseChannel: item.purchaseChannel ?? '',
                    condition: item.condition,
                    status: item.status,
                    estimatedPrice: item.estimatedPrice ? String(item.estimatedPrice) : '',
                    note: item.note ?? '',
                    images: item.images ?? [],
                },
            });
        }
        catch {
            wx.showToast({ title: '读取收藏失败', icon: 'none' });
        }
    },
    onInput(event) {
        this.setData({ [`form.${event.currentTarget.dataset.field}`]: event.detail.value });
    },
    onDate(event) {
        this.setData({ 'form.purchaseDate': event.detail.value });
    },
    onConditionChange(event) {
        const index = Number(event.detail.value);
        this.setData({ conditionIndex: index, 'form.condition': constants_1.conditionOptions[index].value });
    },
    onStatusChange(event) {
        const index = Number(event.detail.value);
        this.setData({ statusIndex: index, 'form.status': constants_1.collectionStatusOptions[index].value });
    },
    onImagesChange(event) {
        this.setData({ 'form.images': event.detail.value });
    },
    async submit() {
        const form = this.data.form;
        this.setData({ saving: true });
        try {
            await (0, request_1.request)({
                url: `/collections/${this.data.id}`,
                method: 'PATCH',
                data: {
                    purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : undefined,
                    purchaseDate: (0, utils_1.toIsoDate)(form.purchaseDate),
                    purchaseChannel: form.purchaseChannel,
                    condition: form.condition,
                    status: form.status,
                    estimatedPrice: form.estimatedPrice ? Number(form.estimatedPrice) : undefined,
                    note: form.note,
                    images: form.images,
                },
            });
            wx.showToast({ title: '收藏已保存' });
            this.loadItem();
        }
        catch (error) {
            wx.showToast({ title: (0, utils_1.apiErrorMessage)(error, '保存失败'), icon: 'none' });
        }
        finally {
            this.setData({ saving: false });
        }
    },
    deleteItem() {
        wx.showModal({
            title: '确认删除这条收藏？',
            confirmText: '删除',
            confirmColor: '#d4380d',
            success: async (res) => {
                if (!res.confirm)
                    return;
                try {
                    await (0, request_1.request)({ url: `/collections/${this.data.id}`, method: 'DELETE' });
                    wx.showToast({ title: '收藏已删除' });
                    wx.switchTab({ url: '/pages/home/index/index' });
                }
                catch (error) {
                    wx.showToast({ title: (0, utils_1.apiErrorMessage)(error, '删除失败'), icon: 'none' });
                }
            },
        });
    },
});
