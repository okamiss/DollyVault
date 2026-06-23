"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.money = money;
exports.dateText = dateText;
exports.dateValue = dateValue;
exports.toIsoDate = toIsoDate;
exports.itemImage = itemImage;
exports.estimateFor = estimateFor;
exports.canManageCatalogItem = canManageCatalogItem;
exports.toUploadedImages = toUploadedImages;
exports.splitTags = splitTags;
exports.apiErrorMessage = apiErrorMessage;
exports.emptyImage = emptyImage;
function money(value) {
    const numberValue = Number(value ?? 0);
    const amount = Number.isFinite(numberValue) ? numberValue : 0;
    return `¥${amount.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}
function dateText(value) {
    if (!value)
        return '未记录';
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return '未记录';
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}
function dateValue(value) {
    if (!value)
        return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return '';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
}
function toIsoDate(value) {
    return value ? new Date(`${value}T00:00:00`).toISOString() : undefined;
}
function itemImage(item) {
    if (!item)
        return '';
    if ('catalogItem' in item) {
        return item.images?.[0]?.url || item.catalogItem.coverImage || item.catalogItem.images?.[0]?.url || '';
    }
    return item.coverImage || item.images?.[0]?.url || '';
}
function estimateFor(item) {
    return item.catalogItem.priceRecords?.[0]?.price ?? item.estimatedPrice ?? item.purchasePrice ?? 0;
}
function canManageCatalogItem(item, user) {
    return Boolean(item && user && item.createdById === user.id);
}
function toUploadedImages(images) {
    return (images ?? []).map((image) => ({
        url: image.url,
        objectKey: image.objectKey,
        provider: image.provider,
        mimeType: image.mimeType,
        size: image.size,
    }));
}
function splitTags(value) {
    return value ? value.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean) : [];
}
function apiErrorMessage(error, fallback) {
    const err = error;
    const message = err.response?.data?.message ?? err.message;
    if (Array.isArray(message))
        return message.join('；');
    return typeof message === 'string' && message.trim() ? message : fallback;
}
function emptyImage() {
    return '';
}
