export interface CurrentUser {
  id: string;
  username: string;
  nickname?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: CurrentUser;
}

export interface UploadedImage {
  url: string;
  objectKey: string;
  provider?: string;
  mimeType?: string;
  size?: number;
}

export interface CatalogItem {
  id: string;
  createdById: string;
  name: string;
  characterName: string;
  series?: string | null;
  model?: string | null;
  releaseDate?: string | null;
  officialPrice?: string | number | null;
  coverImage?: string | null;
  tags: string[];
  description?: string | null;
  images?: UploadedImage[];
  priceRecords?: PriceRecord[];
  collections?: CollectionItem[];
  usageCount?: number;
}

export interface CollectionItem {
  id: string;
  catalogItemId: string;
  catalogItem: CatalogItem;
  purchasePrice?: string | number | null;
  purchaseDate?: string | null;
  purchaseChannel?: string | null;
  condition: CollectionCondition;
  status: CollectionStatus;
  estimatedPrice?: string | number | null;
  note?: string | null;
  images?: UploadedImage[];
  createdAt: string;
}

export type CollectionCondition = 'Mint' | 'NearMint' | 'Good' | 'Damaged';
export type CollectionStatus = 'Holding' | 'Sold' | 'Wishlist' | 'Lost';

export interface PriceRecord {
  id: string;
  catalogItemId: string;
  price: string | number;
  recordDate: string;
  source?: string | null;
  note?: string | null;
}

export interface Statistics {
  totalCount: number;
  purchaseTotal: number;
  estimatedTotal: number;
  floatAmount: number;
  floatRatio: number;
  byCharacter: Array<{ name: string; value: number }>;
  bySeries: Array<{ name: string; value: number }>;
  byStatus: Array<{ name: string; value: number }>;
  monthlyPurchaseTrend: Array<{ month: string; value: number }>;
  monthlyEstimatedTrend: Array<{ month: string; value: number }>;
}

export interface PosterTemplate {
  id?: string;
  key: 'Minimal' | 'CutePink' | 'CollectionCard' | 'Vintage';
  name: string;
  description?: string | null;
}

export interface CollectionEvent {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  catalogItem?: CatalogItem | null;
  collectionItem?: CollectionItem | null;
}
