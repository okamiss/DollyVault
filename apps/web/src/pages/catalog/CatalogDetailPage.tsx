import { Button, Card, Descriptions, Form, Input, InputNumber, Popconfirm, Space, Tag, App as AntApp } from 'antd';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { http } from '../../shared/api/http';
import { EmptyState } from '../../shared/components/EmptyState';
import { PageHeader } from '../../shared/components/PageHeader';
import type { CatalogItem, PriceRecord } from '../../shared/types';
import { dateText, itemImage, money } from '../../shared/utils';
import { AddCollectionModal } from './AddCollectionModal';

interface PriceForm {
  price: number;
  source?: string;
  note?: string;
}

export function CatalogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message } = AntApp.useApp();
  const [addOpen, setAddOpen] = useState(false);

  const catalogQuery = useQuery({
    queryKey: ['catalog', id],
    queryFn: async () => {
      const { data } = await http.get<CatalogItem>(`/catalog/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => http.delete(`/catalog/${id}`),
    onSuccess: async () => {
      message.success('图鉴已删除');
      await queryClient.invalidateQueries({ queryKey: ['catalog'] });
      navigate('/catalog');
    },
  });

  const priceMutation = useMutation({
    mutationFn: async (values: PriceForm) => {
      const { data } = await http.post<PriceRecord>('/price-records', {
        catalogItemId: id,
        price: values.price,
        source: values.source,
        note: values.note,
      });
      return data;
    },
    onSuccess: async () => {
      message.success('价格已记录');
      await queryClient.invalidateQueries({ queryKey: ['catalog', id] });
    },
  });

  const item = catalogQuery.data;

  if (!item) {
    return (
      <>
        <PageHeader title="图鉴详情" back />
        <EmptyState title="正在读取图鉴" />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="图鉴详情"
        back
        action={
          <Space>
            <Button icon={<Pencil size={16} />} onClick={() => navigate(`/catalog/${id}/edit`)}>
              编辑
            </Button>
            <Popconfirm title="确认删除这条图鉴？" onConfirm={() => deleteMutation.mutate()}>
              <Button danger icon={<Trash2 size={16} />}>删除</Button>
            </Popconfirm>
          </Space>
        }
      />
      <section className="detail-hero">
        <img src={itemImage(item) || undefined} alt={item.name} />
      </section>
      <Card className="detail-card">
        <div className="detail-title-row">
          <div>
            <h2>{item.name}</h2>
            <p>{item.characterName} · {item.series || '未设置系列'}</p>
          </div>
          <Button type="primary" icon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
            添加到我的收藏
          </Button>
        </div>
        <Space wrap>
          {item.tags?.map((tag) => <Tag key={tag} color="pink">{tag}</Tag>)}
        </Space>
        <Descriptions column={1} bordered size="small" className="detail-descriptions">
          <Descriptions.Item label="型号">{item.model || '未设置'}</Descriptions.Item>
          <Descriptions.Item label="发售日期">{dateText(item.releaseDate)}</Descriptions.Item>
          <Descriptions.Item label="官方价格">{item.officialPrice ? money(item.officialPrice) : '未记录'}</Descriptions.Item>
          <Descriptions.Item label="简介">{item.description || '暂无简介'}</Descriptions.Item>
        </Descriptions>
      </Card>
      <Card title="价格历史" className="detail-card">
        <Form<PriceForm> layout="inline" onFinish={(values) => priceMutation.mutate(values)}>
          <Form.Item name="price" rules={[{ required: true, message: '请输入价格' }]}>
            <InputNumber min={0} prefix="¥" placeholder="价格" />
          </Form.Item>
          <Form.Item name="source">
            <Input placeholder="来源" />
          </Form.Item>
          <Form.Item name="note">
            <Input placeholder="备注" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={priceMutation.isPending}>
            添加价格
          </Button>
        </Form>
        <div className="price-list">
          {(item.priceRecords ?? []).length === 0 ? (
            <EmptyState title="暂无价格记录" />
          ) : (
            item.priceRecords?.map((record) => (
              <div key={record.id} className="price-row">
                <strong>{money(record.price)}</strong>
                <span>{record.source || '未标注来源'}</span>
                <small>{dateText(record.recordDate)}</small>
              </div>
            ))
          )}
        </div>
      </Card>
      <AddCollectionModal open={addOpen} item={item} onCancel={() => setAddOpen(false)} />
    </>
  );
}
