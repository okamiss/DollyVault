"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = require("../../../shared/api/request");
const auth_1 = require("../../../shared/auth");
const utils_1 = require("../../../shared/utils");
Page({
    data: {
        stats: null,
        statCards: [],
        characterBars: [],
        trendPoints: '',
    },
    onShow() {
        if (!(0, auth_1.ensureAuthenticated)())
            return;
        this.loadStats();
    },
    async loadStats() {
        try {
            const stats = await (0, request_1.request)({ url: '/statistics' });
            const maxCharacter = Math.max(...stats.byCharacter.map((item) => item.value), 1);
            this.setData({
                stats,
                statCards: [
                    { label: '总数量', value: `${stats.totalCount} 只` },
                    { label: '入手合计', value: (0, utils_1.money)(stats.purchaseTotal) },
                    { label: '估值合计', value: (0, utils_1.money)(stats.estimatedTotal) },
                    { label: '浮动比例', value: `${(stats.floatRatio * 100).toFixed(1)}%` },
                ],
                characterBars: stats.byCharacter.slice(0, 8).map((item) => ({
                    ...item,
                    width: Math.max(8, Math.round((item.value / maxCharacter) * 100)),
                })),
            });
            this.drawTrend(stats);
        }
        catch {
            wx.showToast({ title: '读取统计失败', icon: 'none' });
        }
    },
    drawTrend(stats) {
        const query = wx.createSelectorQuery();
        query.select('#trendCanvas').fields({ node: true, size: true }).exec((res) => {
            const canvas = res?.[0]?.node;
            if (!canvas)
                return;
            const width = res[0].width;
            const height = res[0].height;
            const ctx = canvas.getContext('2d');
            const dpr = wx.getSystemInfoSync().pixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
            ctx.clearRect(0, 0, width, height);
            ctx.strokeStyle = '#e8edf4';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(20, height - 28);
            ctx.lineTo(width - 12, height - 28);
            ctx.stroke();
            const values = stats.monthlyEstimatedTrend.map((item) => item.value);
            if (values.length === 0)
                return;
            const max = Math.max(...values, 1);
            const step = values.length > 1 ? (width - 48) / (values.length - 1) : 0;
            ctx.strokeStyle = '#ff5c9a';
            ctx.lineWidth = 3;
            ctx.beginPath();
            values.forEach((value, index) => {
                const x = 24 + index * step;
                const y = height - 32 - (value / max) * (height - 56);
                if (index === 0)
                    ctx.moveTo(x, y);
                else
                    ctx.lineTo(x, y);
            });
            ctx.stroke();
        });
    },
});
