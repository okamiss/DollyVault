import type { CatalogItem, CollectionItem } from './types';

export function money(value: string | number | null | undefined) {
  const numberValue = Number(value ?? 0);
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(Number.isFinite(numberValue) ? numberValue : 0);
}

export function dateText(value: string | null | undefined) {
  if (!value) return '未记录';
  return new Intl.DateTimeFormat('zh-CN').format(new Date(value));
}

export function itemImage(item?: CatalogItem | CollectionItem | null) {
  if (!item) return '';
  if ('catalogItem' in item) {
    return item.images?.[0]?.url || item.catalogItem.coverImage || item.catalogItem.images?.[0]?.url || '';
  }
  return item.coverImage || item.images?.[0]?.url || '';
}

export function estimateFor(item: CollectionItem) {
  return (
    item.catalogItem.priceRecords?.[0]?.price ??
    item.estimatedPrice ??
    item.purchasePrice ??
    0
  );
}
