import { describe, expect, it } from 'vitest';
import {
  canManageCatalogItem,
  getApiErrorMessage,
  groupCatalogItemsByOwnership,
  money,
  toUploadedImages,
} from './utils';

describe('money', () => {
  it('formats values as CNY', () => {
    expect(money(399)).toContain('399.00');
  });
});

describe('canManageCatalogItem', () => {
  it('only allows the creator to manage a catalog item', () => {
    expect(canManageCatalogItem({ createdById: 'user-1' }, { id: 'user-1' })).toBe(true);
    expect(canManageCatalogItem({ createdById: 'user-1' }, { id: 'user-2' })).toBe(false);
    expect(canManageCatalogItem({ createdById: 'user-1' }, null)).toBe(false);
  });
});

describe('groupCatalogItemsByOwnership', () => {
  it('puts current user catalog items before public catalog items', () => {
    const items = [
      { id: 'public-1', createdById: 'user-2' },
      { id: 'owned-1', createdById: 'user-1' },
      { id: 'public-2', createdById: 'user-3' },
    ];

    expect(groupCatalogItemsByOwnership(items, { id: 'user-1' })).toEqual({
      owned: [{ id: 'owned-1', createdById: 'user-1' }],
      publicItems: [
        { id: 'public-1', createdById: 'user-2' },
        { id: 'public-2', createdById: 'user-3' },
      ],
    });
  });
});

describe('toUploadedImages', () => {
  it('removes database-only catalog image fields before saving', () => {
    expect(
      toUploadedImages([
        {
          id: 'db-image-1',
          catalogItemId: 'catalog-1',
          url: 'https://example.com/image.png',
          objectKey: 'catalog/image.png',
          provider: 'aliyun-oss',
          mimeType: 'image/png',
          size: 123,
          sortOrder: 0,
          createdAt: '2026-06-12T09:16:42.280Z',
        },
      ]),
    ).toEqual([
      {
        url: 'https://example.com/image.png',
        objectKey: 'catalog/image.png',
        provider: 'aliyun-oss',
        mimeType: 'image/png',
        size: 123,
      },
    ]);
  });
});

describe('getApiErrorMessage', () => {
  it('reads string messages returned by the API', () => {
    expect(
      getApiErrorMessage(
        { response: { data: { message: '已有收藏使用这条图鉴，不能删除' } } },
        '删除失败',
      ),
    ).toBe('已有收藏使用这条图鉴，不能删除');
  });

  it('joins array messages returned by the API', () => {
    expect(
      getApiErrorMessage(
        { response: { data: { message: ['字段 A 错误', '字段 B 错误'] } } },
        '保存失败',
      ),
    ).toBe('字段 A 错误；字段 B 错误');
  });

  it('falls back when the API does not return a usable message', () => {
    expect(getApiErrorMessage({}, '操作失败')).toBe('操作失败');
  });
});
