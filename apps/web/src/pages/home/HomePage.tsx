import { Button, Card, Segmented, Space, Statistic, Tag } from 'antd';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { PackagePlus } from 'lucide-react';
import { http } from '../../shared/api/http';
import { EmptyState } from '../../shared/components/EmptyState';
import { PageHeader } from '../../shared/components/PageHeader';
import type { CollectionItem, CollectionStatus, Statistics } from '../../shared/types';
import { dateText, estimateFor, itemImage, money } from '../../shared/utils';

const statuses: Array<{ label: string; value: CollectionStatus | 'All' }> = [
  { label: '全部', value: 'All' },
  { label: '持有中', value: 'Holding' },
  { label: '已出售', value: 'Sold' },
  { label: '心愿单', value: 'Wishlist' },
  { label: '已遗失', value: 'Lost' },
];

export function HomePage() {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState<CollectionStatus | 'All'>('All');
  const collectionsQuery = useQuery({
    queryKey: ['collections', selectedStatus],
    queryFn: async () => {
      const { data } = await http.get<CollectionItem[]>('/collections', {
        params: selectedStatus === 'All' ? {} : { status: selectedStatus },
      });
      return data;
    },
  });
  const statsQuery = useQuery({
    queryKey: ['statistics'],
    queryFn: async () => {
      const { data } = await http.get<Statistics>('/statistics');
      return data;
    },
  });

  const collections = collectionsQuery.data ?? [];

  return (
    <>
      <PageHeader
        title="我的收藏"
        subtitle="记录每一次入手、估值和状态变化"
        action={
          <Button
            type="primary"
            icon={<PackagePlus size={16} />}
            onClick={() => navigate('/catalog')}
          >
            去图鉴添加
          </Button>
        }
      />

      <section className="summary-card">
        <div>
          <span>收藏了 {statsQuery.data?.totalCount ?? 0} 只宝贝</span>
          <strong>{money(statsQuery.data?.estimatedTotal ?? 0)}</strong>
          <small>当前估值合计</small>
        </div>
        <Statistic
          title="浮动"
          value={statsQuery.data?.floatRatio ? statsQuery.data.floatRatio * 100 : 0}
          precision={1}
          suffix="%"
        />
      </section>

      <div className="section-title-row">
        <h2>库存列表</h2>
        <Segmented
          options={statuses.map((status) => status.label)}
          defaultValue="全部"
          onChange={(label) => {
            const value = statuses.find((status) => status.label === label)?.value;
            setSelectedStatus(value ?? 'All');
          }}
        />
      </div>

      {collections.length === 0 ? (
        <EmptyState
          title="还没有收藏宝贝"
          description="先去图鉴创建或选择一个商品，再加入你的收藏。"
          actionText="去图鉴看看"
          onAction={() => navigate('/catalog')}
        />
      ) : (
        <div className="collection-list">
          {collections.map((item) => (
            <Card
              key={item.id}
              className="collection-card"
              hoverable
              onClick={() => navigate(`/collections/${item.id}`)}
            >
              <img src={itemImage(item) || undefined} alt={item.catalogItem.name} />
              <div>
                <strong>{item.catalogItem.name}</strong>
                <Space wrap>
                  <Tag color="pink">{item.condition}</Tag>
                  <Tag color="green">{item.status}</Tag>
                </Space>
                <span>{dateText(item.purchaseDate)}</span>
              </div>
              <div className="collection-price">
                <strong>{money(estimateFor(item))}</strong>
                <small>购入 {money(item.purchasePrice)}</small>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
