import type { CollectionCondition, CollectionStatus, OptionItem } from './types';

export const statusOptions: Array<OptionItem<CollectionStatus | 'All'>> = [
  { label: '全部', value: 'All' },
  { label: '持有中', value: 'Holding' },
  { label: '已出售', value: 'Sold' },
  { label: '心愿单', value: 'Wishlist' },
  { label: '已遗失', value: 'Lost' },
];

export const collectionStatusOptions: Array<OptionItem<CollectionStatus>> = [
  { label: '持有中', value: 'Holding' },
  { label: '已出售', value: 'Sold' },
  { label: '心愿单', value: 'Wishlist' },
  { label: '已遗失', value: 'Lost' },
];

export const conditionOptions: Array<OptionItem<CollectionCondition>> = [
  { label: '全新 (Mint)', value: 'Mint' },
  { label: '近全新 (NearMint)', value: 'NearMint' },
  { label: '良好 (Good)', value: 'Good' },
  { label: '有损 (Damaged)', value: 'Damaged' },
];

export const posterTemplates = [
  { key: 'Minimal', name: '简约风格' },
  { key: 'CutePink', name: '可爱粉色风格' },
  { key: 'CollectionCard', name: '收藏卡片风格' },
  { key: 'Vintage', name: '复古风格' },
] as const;

export function labelFor<T extends string>(options: Array<OptionItem<T>>, value?: T | null) {
  return options.find((item) => item.value === value)?.label ?? value ?? '未设置';
}
