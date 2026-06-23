"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("./shared/auth");
const request_1 = require("./shared/api/request");
App({
    globalData: {
        user: null,
    },
    onLaunch() {
        const auth = (0, auth_1.getStoredAuth)();
        this.globalData.user = auth.user;
        if (auth.token) {
            this.refreshCurrentUser();
        }
    },
    async refreshCurrentUser() {
        try {
            const user = await (0, request_1.request)({ url: '/auth/me' });
            (0, auth_1.setStoredUser)(user);
            this.globalData.user = user;
        }
        catch {
            (0, auth_1.clearAuth)();
            this.globalData.user = null;
        }
    },
});
