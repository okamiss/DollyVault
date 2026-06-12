import { Button, Card, DatePicker, Form, Input, InputNumber, Popconfirm, Select, Space, Tag, App as AntApp } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { Trash2 } from 'lucide-react';
import { http } from '../../shared/api/http';
import { EmptyState } from '../../shared/components/EmptyState';
import { ImageUploader } from '../../shared/components/ImageUploader';
import { PageHeader } from '../../shared/components/PageHeader';
import type { CollectionItem, UploadedImage } from '../../shared/types';
import { dateText, estimateFor, itemImage, money } from '../../shared/utils';

interface CollectionForm {
  purchasePrice?: number;
  purchaseDate?: dayjs.Dayjs;
  purchaseChannel?: string;
  condition?: string;
  status?: string;
  estimatedPrice?: number;
  note?: string;
  images?: UploadedImage[];
}

export function CollectionDetailPage() {
  const { id } = useParams();
  const [form] = Form.useForm<CollectionForm>();
  const navigate = useNavigate();
  const { message } = AntApp.useApp();
  const queryClient = useQueryClient();

  const collectionQuery = useQuery({
    queryKey: ['collections', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await http.get<CollectionItem>(`/collections/${id}`);
      form.setFieldsValue({
        purchasePrice: Number(data.purchasePrice ?? 0) || undefined,
        purchaseDate: data.purchaseDate ? dayjs(data.purchaseDate) : undefined,
        purchaseChannel: data.purchaseChannel ?? undefined,
        condition: data.condition,
        status: data.status,
        estimatedPrice: Number(data.estimatedPrice ?? 0) || undefined,
        note: data.note ?? undefined,
        images: data.images ?? [],
      });
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: CollectionForm) => {
      const { data } = await http.patch<CollectionItem>(`/collections/${id}`, {
        purchasePrice: values.purchasePrice,
        purchaseDate: values.purchaseDate?.toISOString(),
        purchaseChannel: values.purchaseChannel,
        condition: values.condition,
        status: values.status,
        estimatedPrice: values.estimatedPrice,
        note: values.note,
        images: values.images ?? [],
      });
      return data;
    },
    onSuccess: async () => {
      message.success('收藏已保存');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['collections'] }),
        queryClient.invalidateQueries({ queryKey: ['statistics'] }),
      ]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => http.delete(`/collections/${id}`),
    onSuccess: async () => {
      message.success('收藏已删除');
      await queryClient.invalidateQueries({ queryKey: ['collections'] });
      navigate('/');
    },
  });

  const item = collectionQuery.data;

  if (!item) {
    return (
      <>
        <PageHeader title="收藏详情" back />
        <EmptyState title="正在读取收藏" />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="收藏详情"
        back
        action={
          <Popconfirm title="确认删除这条收藏？" onConfirm={() => deleteMutation.mutate()}>
            <Button danger icon={<Trash2 size={16} />}>删除</Button>
          </Popconfirm>
        }
      />
      <Card className="detail-card">
        <div className="collection-detail-head">
          <img src={itemImage(item) || undefined} alt={item.catalogItem.name} />
          <div>
            <h2>{item.catalogItem.name}</h2>
            <p>{item.catalogItem.characterName} · {item.catalogItem.series || '未设置系列'}</p>
            <Space wrap>
              <Tag color="pink">{item.condition}</Tag>
              <Tag color="green">{item.status}</Tag>
            </Space>
          </div>
          <div className="collection-price">
            <strong>{money(estimateFor(item))}</strong>
            <small>购入 {money(item.purchasePrice)}</small>
            <small>{dateText(item.purchaseDate)}</small>
          </div>
        </div>
      </Card>
      <Form<CollectionForm>
        form={form}
        layout="vertical"
        className="form-surface"
        onFinish={(values) => updateMutation.mutate(values)}
      >
        <Form.Item label="购入价格" name="purchasePrice">
          <InputNumber min={0} prefix="¥" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="购入日期" name="purchaseDate">
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="购入渠道" name="purchaseChannel">
          <Input placeholder="购入渠道" />
        </Form.Item>
        <Form.Item label="品相" name="condition">
          <Select
            options={[
              { label: '全新 (Mint)', value: 'Mint' },
              { label: '近全新 (NearMint)', value: 'NearMint' },
              { label: '良好 (Good)', value: 'Good' },
              { label: '有损 (Damaged)', value: 'Damaged' },
            ]}
          />
        </Form.Item>
        <Form.Item label="状态" name="status">
          <Select
            options={[
              { label: '持有中', value: 'Holding' },
              { label: '已出售', value: 'Sold' },
              { label: '心愿单', value: 'Wishlist' },
              { label: '已遗失', value: 'Lost' },
            ]}
          />
        </Form.Item>
        <Form.Item label="当前估值" name="estimatedPrice">
          <InputNumber min={0} prefix="¥" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="备注" name="note">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item label="实拍图" name="images">
          <ImageUploader />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={updateMutation.isPending}>
          保存收藏
        </Button>
      </Form>
    </>
  );
}
