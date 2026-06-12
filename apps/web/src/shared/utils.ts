import type { CatalogItem, CollectionItem, CurrentUser, UploadedImage } from './types';

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

export function canManageCatalogItem(
  item: Pick<CatalogItem, 'createdById'> | null | undefined,
  user: Pick<CurrentUser, 'id'> | null | undefined,
) {
  return Boolean(item && user && item.createdById === user.id);
}

export function groupCatalogItemsByOwnership<T extends Pick<CatalogItem, 'createdById'>>(
  items: T[],
  user: Pick<CurrentUser, 'id'> | null | undefined,
) {
  return {
    owned: items.filter((item) => canManageCatalogItem(item, user)),
    publicItems: items.filter((item) => !canManageCatalogItem(item, user)),
  };
}

export function toUploadedImages<T extends UploadedImage>(
  images: T[] | null | undefined,
): UploadedImage[] {
  return (images ?? []).map((image) => ({
    url: image.url,
    objectKey: image.objectKey,
    provider: image.provider,
    mimeType: image.mimeType,
    size: image.size,
  }));
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  const message = (error as { response?: { data?: { message?: unknown } } })?.response?.data
    ?.message;
  if (Array.isArray(message)) {
    return message.join('；');
  }
  return typeof message === 'string' && message.trim() ? message : fallback;
}
