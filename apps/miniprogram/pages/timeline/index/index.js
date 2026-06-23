"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = require("../../../shared/api/request");
const auth_1 = require("../../../shared/auth");
const utils_1 = require("../../../shared/utils");
Page({
    data: {
        events: [],
    },
    onShow() {
        if (!(0, auth_1.ensureAuthenticated)())
            return;
        this.loadEvents();
    },
    async loadEvents() {
        try {
            const events = await (0, request_1.request)({ url: '/events' });
            this.setData({
                events: events.map((event) => ({
                    ...event,
                    timeText: (0, utils_1.dateText)(event.createdAt),
                    danger: event.type === 'Deleted',
                })),
            });
        }
        catch {
            wx.showToast({ title: '读取历史失败', icon: 'none' });
        }
    },
});
