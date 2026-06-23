"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = require("../../../shared/api/request");
const auth_1 = require("../../../shared/auth");
const utils_1 = require("../../../shared/utils");
Page({
    data: {
        search: '',
        owned: [],
        publicItems: [],
        loading: false,
    },
    onShow() {
        if (!(0, auth_1.ensureAuthenticated)())
            return;
        this.loadCatalog();
    },
    onSearchInput(event) {
        this.setData({ search: event.detail.value });
    },
    submitSearch() {
        this.loadCatalog();
    },
    async loadCatalog() {
        this.setData({ loading: true });
        try {
            const catalog = await (0, request_1.request)({
                url: '/catalog',
                params: this.data.search ? { search: this.data.search.trim() } : {},
            });
            const user = getApp().globalData.user;
            const views = catalog.map((item) => ({
                ...item,
                imageUrl: (0, utils_1.itemImage)(item),
                officialPriceText: item.officialPrice ? `官方价 ${(0, utils_1.money)(item.officialPrice)}` : '未记录官方价',
            }));
            this.setData({
                owned: views.filter((item) => (0, utils_1.canManageCatalogItem)(item, user)),
                publicItems: views.filter((item) => !(0, utils_1.canManageCatalogItem)(item, user)),
            });
        }
        catch {
            wx.showToast({ title: '读取图鉴失败', icon: 'none' });
        }
        finally {
            this.setData({ loading: false });
        }
    },
    goCreate() {
        wx.navigateTo({ url: '/pages/catalog/form/index' });
    },
    goDetail(event) {
        wx.navigateTo({ url: `/pages/catalog/detail/index?id=${event.currentTarget.dataset.id}` });
    },
});
