"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.posterTemplates = exports.conditionOptions = exports.collectionStatusOptions = exports.statusOptions = void 0;
exports.labelFor = labelFor;
exports.statusOptions = [
    { label: '全部', value: 'All' },
    { label: '持有中', value: 'Holding' },
    { label: '已出售', value: 'Sold' },
    { label: '心愿单', value: 'Wishlist' },
    { label: '已遗失', value: 'Lost' },
];
exports.collectionStatusOptions = [
    { label: '持有中', value: 'Holding' },
    { label: '已出售', value: 'Sold' },
    { label: '心愿单', value: 'Wishlist' },
    { label: '已遗失', value: 'Lost' },
];
exports.conditionOptions = [
    { label: '全新 (Mint)', value: 'Mint' },
    { label: '近全新 (NearMint)', value: 'NearMint' },
    { label: '良好 (Good)', value: 'Good' },
    { label: '有损 (Damaged)', value: 'Damaged' },
];
exports.posterTemplates = [
    { key: 'Minimal', name: '简约风格' },
    { key: 'CutePink', name: '可爱粉色风格' },
    { key: 'CollectionCard', name: '收藏卡片风格' },
    { key: 'Vintage', name: '复古风格' },
];
function labelFor(options, value) {
    return options.find((item) => item.value === value)?.label ?? value ?? '未设置';
}
