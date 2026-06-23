import type { CatalogItem, CollectionItem, CurrentUser, UploadedImage } from './types';

export function money(value: string | number | null | undefined) {
  const numberValue = Number(value ?? 0);
  const amount = Number.isFinite(numberValue) ? numberValue : 0;
  return `¥${amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function dateText(value: string | null | undefined) {
  if (!value) return '未记录';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '未记录';
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

export function dateValue(value: string | null | undefined) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function toIsoDate(value?: string) {
  return value ? new Date(`${value}T00:00:00`).toISOString() : undefined;
}

export function itemImage(item?: CatalogItem | CollectionItem | null) {
  if (!item) return '';
  if ('catalogItem' in item) {
    return item.images?.[0]?.url || item.catalogItem.coverImage || item.catalogItem.images?.[0]?.url || '';
  }
  return item.coverImage || item.images?.[0]?.url || '';
}

export function estimateFor(item: CollectionItem) {
  return item.catalogItem.priceRecords?.[0]?.price ?? item.estimatedPrice ?? item.purchasePrice ?? 0;
}

export function canManageCatalogItem(
  item: Pick<CatalogItem, 'createdById'> | null | undefined,
  user: Pick<CurrentUser, 'id'> | null | undefined,
) {
  return Boolean(item && user && item.createdById === user.id);
}

export function toUploadedImages<T extends UploadedImage>(images: T[] | null | undefined): UploadedImage[] {
  return (images ?? []).map((image) => ({
    url: image.url,
    objectKey: image.objectKey,
    provider: image.provider,
    mimeType: image.mimeType,
    size: image.size,
  }));
}

export function splitTags(value?: string) {
  return value ? value.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean) : [];
}

export function apiErrorMessage(error: unknown, fallback: string) {
  const err = error as { message?: string; response?: { data?: { message?: unknown } } };
  const message = err.response?.data?.message ?? err.message;
  if (Array.isArray(message)) return message.join('；');
  return typeof message === 'string' && message.trim() ? message : fallback;
}

export function emptyImage() {
  return '';
}
