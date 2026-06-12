import { DatePicker, Form, Input, InputNumber, Modal, Select, App as AntApp } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { http } from '../../shared/api/http';
import { ImageUploader } from '../../shared/components/ImageUploader';
import type { CatalogItem, UploadedImage } from '../../shared/types';
import { itemImage } from '../../shared/utils';

interface AddCollectionModalProps {
  open: boolean;
  item: CatalogItem;
  onCancel: () => void;
}

interface FormValues {
  purchasePrice?: number;
  purchaseDate?: dayjs.Dayjs;
  purchaseChannel?: string;
  condition?: string;
  status?: string;
  estimatedPrice?: number;
  note?: string;
  images?: UploadedImage[];
}

export function AddCollectionModal({ open, item, onCancel }: AddCollectionModalProps) {
  const [form] = Form.useForm<FormValues>();
  const queryClient = useQueryClient();
  const { message } = AntApp.useApp();

  const addMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const { data } = await http.post('/collections', {
        catalogItemId: item.id,
        purchasePrice: values.purchasePrice,
        purchaseDate: values.purchaseDate?.toISOString(),
        purchaseChannel: values.purchaseChannel,
        condition: values.condition ?? 'Mint',
        status: values.status ?? 'Holding',
        estimatedPrice: values.estimatedPrice,
        note: values.note,
        images: values.images ?? [],
      });
      return data;
    },
    onSuccess: async () => {
      message.success('已保存到我的收藏');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['collections'] }),
        queryClient.invalidateQueries({ queryKey: ['statistics'] }),
      ]);
      form.resetFields();
      onCancel();
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || '保存失败');
    },
  });

  return (
    <Modal
      title="添加到我的收藏"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={addMutation.isPending}
      okText="保存到我的收藏"
      destroyOnClose
    >
      <div className="modal-product">
        <img src={itemImage(item) || undefined} alt={item.name} />
        <div>
          <strong>{item.name}</strong>
          <span>{item.characterName} · {item.series || '未设置系列'}</span>
        </div>
      </div>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          purchaseDate: dayjs(),
          condition: 'Mint',
          status: 'Holding',
        }}
        onFinish={(values) => addMutation.mutate(values)}
      >
        <Form.Item label="购入价格" name="purchasePrice">
          <InputNumber min={0} prefix="¥" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="购入日期" name="purchaseDate">
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="购入渠道" name="purchaseChannel">
          <Input placeholder="请选择或填写渠道" />
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
          <Input.TextArea rows={3} placeholder="可选备注信息" />
        </Form.Item>
        <Form.Item label="实拍图" name="images">
          <ImageUploader />
        </Form.Item>
      </Form>
    </Modal>
  );
}
