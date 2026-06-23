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
        gallery: [],
        releaseDateText: '',
        officialPriceText: '',
        descriptionText: '',
        priceRecords: [],
        canManage: false,
        price: '',
        priceSource: '',
        priceNote: '',
        showAddForm: false,
        addForm: {
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
            const item = await (0, request_1.request)({ url: `/catalog/${this.data.id}` });
            const gallery = item.images?.length ? item.images : item.coverImage ? [{ url: item.coverImage, objectKey: item.coverImage }] : [];
            this.setData({
                item,
                gallery,
                releaseDateText: (0, utils_1.dateText)(item.releaseDate),
                officialPriceText: item.officialPrice ? (0, utils_1.money)(item.officialPrice) : '未记录',
                descriptionText: item.description || '暂无简介',
                priceRecords: (item.priceRecords ?? []).map((record) => ({
                    ...record,
                    priceText: (0, utils_1.money)(record.price),
                    recordDateText: (0, utils_1.dateText)(record.recordDate),
                })),
                canManage: (0, utils_1.canManageCatalogItem)(item, getApp().globalData.user),
            });
        }
        catch {
            wx.showToast({ title: '读取图鉴失败', icon: 'none' });
        }
    },
    previewImage(event) {
        const urls = this.data.gallery.map((image) => image.url);
        wx.previewImage({ current: event.currentTarget.dataset.url, urls });
    },
    goEdit() {
        wx.navigateTo({ url: `/pages/catalog/form/index?id=${this.data.id}` });
    },
    deleteItem() {
        wx.showModal({
            title: '确认删除这条图鉴？',
            content: '删除后无法恢复。已被收藏使用的图鉴不能删除。',
            confirmText: '删除',
            confirmColor: '#d4380d',
            success: async (res) => {
                if (!res.confirm)
                    return;
                try {
                    await (0, request_1.request)({ url: `/catalog/${this.data.id}`, method: 'DELETE' });
                    wx.showToast({ title: '图鉴已删除' });
                    wx.navigateBack();
                }
                catch (error) {
                    wx.showToast({ title: (0, utils_1.apiErrorMessage)(error, '删除失败'), icon: 'none' });
                }
            },
        });
    },
    onPriceInput(event) {
        this.setData({ [event.currentTarget.dataset.field]: event.detail.value });
    },
    async submitPrice() {
        const price = Number(this.data.price);
        if (!Number.isFinite(price) || price < 0) {
            wx.showToast({ title: '请输入价格', icon: 'none' });
            return;
        }
        try {
            await (0, request_1.request)({
                url: '/price-records',
                method: 'POST',
                data: {
                    catalogItemId: this.data.id,
                    price,
                    source: this.data.priceSource,
                    note: this.data.priceNote,
                },
            });
            wx.showToast({ title: '价格已记录' });
            this.setData({ price: '', priceSource: '', priceNote: '' });
            this.loadItem();
        }
        catch (error) {
            wx.showToast({ title: (0, utils_1.apiErrorMessage)(error, '保存失败'), icon: 'none' });
        }
    },
    toggleAddForm() {
        this.setData({ showAddForm: !this.data.showAddForm });
    },
    onAddInput(event) {
        this.setData({ [`addForm.${event.currentTarget.dataset.field}`]: event.detail.value });
    },
    onAddDate(event) {
        this.setData({ 'addForm.purchaseDate': event.detail.value });
    },
    onConditionChange(event) {
        const index = Number(event.detail.value);
        this.setData({ conditionIndex: index, 'addForm.condition': constants_1.conditionOptions[index].value });
    },
    onStatusChange(event) {
        const index = Number(event.detail.value);
        this.setData({ statusIndex: index, 'addForm.status': constants_1.collectionStatusOptions[index].value });
    },
    onImagesChange(event) {
        this.setData({ 'addForm.images': event.detail.value });
    },
    async submitCollection() {
        const form = this.data.addForm;
        try {
            await (0, request_1.request)({
                url: '/collections',
                method: 'POST',
                data: {
                    catalogItemId: this.data.id,
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
            wx.showToast({ title: '已保存到我的收藏' });
            this.setData({ showAddForm: false });
        }
        catch (error) {
            wx.showToast({ title: (0, utils_1.apiErrorMessage)(error, '保存失败'), icon: 'none' });
        }
    },
    dateText: utils_1.dateText,
    money: utils_1.money,
});
