"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = require("../../../shared/api/request");
const auth_1 = require("../../../shared/auth");
const constants_1 = require("../../../shared/constants");
const utils_1 = require("../../../shared/utils");
Page({
    data: {
        statusOptions: constants_1.statusOptions,
        selectedStatus: 'All',
        collections: [],
        stats: null,
        estimatedTotalText: '¥0.00',
        floatRatioText: '0.0',
        loading: false,
    },
    onShow() {
        if (!(0, auth_1.ensureAuthenticated)())
            return;
        this.loadData();
    },
    async loadData() {
        this.setData({ loading: true });
        try {
            const selectedStatus = this.data.selectedStatus;
            const [collections, stats] = await Promise.all([
                (0, request_1.request)({
                    url: '/collections',
                    params: selectedStatus === 'All' ? {} : { status: selectedStatus },
                }),
                (0, request_1.request)({ url: '/statistics' }),
            ]);
            this.setData({
                stats,
                estimatedTotalText: (0, utils_1.money)(stats.estimatedTotal),
                floatRatioText: (stats.floatRatio * 100).toFixed(1),
                collections: collections.map(this.toCollectionView),
            });
        }
        catch {
            wx.showToast({ title: '读取收藏失败', icon: 'none' });
        }
        finally {
            this.setData({ loading: false });
        }
    },
    toCollectionView(item) {
        return {
            ...item,
            imageUrl: (0, utils_1.itemImage)(item),
            estimateText: (0, utils_1.money)((0, utils_1.estimateFor)(item)),
            purchaseText: (0, utils_1.money)(item.purchasePrice),
            purchaseDateText: (0, utils_1.dateText)(item.purchaseDate),
        };
    },
    selectStatus(event) {
        this.setData({ selectedStatus: event.currentTarget.dataset.value }, () => this.loadData());
    },
    goCatalog() {
        wx.switchTab({ url: '/pages/catalog/list/index' });
    },
    goCollection(event) {
        wx.navigateTo({ url: `/pages/collections/detail/index?id=${event.currentTarget.dataset.id}` });
    },
});
