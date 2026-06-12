import { Button, Card, Input, Space, Tag } from 'antd';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { http } from '../../shared/api/http';
import { EmptyState } from '../../shared/components/EmptyState';
import { PageHeader } from '../../shared/components/PageHeader';
import type { CatalogItem } from '../../shared/types';
import { itemImage, money } from '../../shared/utils';

export function CatalogListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const catalogQuery = useQuery({
    queryKey: ['catalog', search],
    queryFn: async () => {
      const { data } = await http.get<CatalogItem[]>('/catalog', {
        params: search ? { search } : {},
      });
      return data;
    },
  });

  const catalog = catalogQuery.data ?? [];

  return (
    <>
      <PageHeader
        title="图鉴"
        subtitle="公共商品数据库，可从图鉴加入你的个人收藏。"
        action={
          <Button type="primary" icon={<Plus size={16} />} onClick={() => navigate('/catalog/new')}>
            创建图鉴
          </Button>
        }
      />
      <Input
        size="large"
        prefix={<Search size={16} />}
        placeholder="搜索名称、角色、系列或标签"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        allowClear
        className="search-input"
      />
      {catalog.length === 0 ? (
        <EmptyState
          title="暂无图鉴数据"
          description="创建你的第一条图鉴，后续就可以加入收藏。"
          actionText="创建第一个图鉴"
          onAction={() => navigate('/catalog/new')}
        />
      ) : (
        <div className="catalog-grid">
          {catalog.map((item) => (
            <Card
              key={item.id}
              hoverable
              className="catalog-card"
              onClick={() => navigate(`/catalog/${item.id}`)}
              cover={<img src={itemImage(item) || undefined} alt={item.name} />}
            >
              <strong>{item.name}</strong>
              <span>{item.characterName} · {item.series || '未设置系列'}</span>
              <Space wrap>
                {item.tags?.slice(0, 3).map((tag) => <Tag key={tag}>{tag}</Tag>)}
              </Space>
              <small>{item.officialPrice ? `官方价 ${money(item.officialPrice)}` : '未记录官方价'}</small>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
