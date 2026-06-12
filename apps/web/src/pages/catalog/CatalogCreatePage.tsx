import { Button, DatePicker, Form, Input, InputNumber, App as AntApp } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { http } from '../../shared/api/http';
import { EmptyState } from '../../shared/components/EmptyState';
import { ImageUploader } from '../../shared/components/ImageUploader';
import { PageHeader } from '../../shared/components/PageHeader';
import { useAuthStore } from '../../shared/stores/authStore';
import type { CatalogItem, UploadedImage } from '../../shared/types';
import { canManageCatalogItem, toUploadedImages } from '../../shared/utils';

interface CatalogForm {
  name: string;
  characterName: string;
  series?: string;
  model?: string;
  releaseDate?: dayjs.Dayjs;
  officialPrice?: number;
  tags?: string;
  description?: string;
  images?: UploadedImage[];
}

export function CatalogCreatePage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form] = Form.useForm<CatalogForm>();
  const { message } = AntApp.useApp();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  const catalogQuery = useQuery({
    queryKey: ['catalog', id],
    enabled: isEdit && Boolean(id),
    queryFn: async () => {
      const { data } = await http.get<CatalogItem>(`/catalog/${id}`);
      return data;
    },
  });
  const editingItem = catalogQuery.data;
  const canEdit = !isEdit || canManageCatalogItem(editingItem, currentUser);

  useEffect(() => {
    if (!editingItem) return;

    form.setFieldsValue({
      name: editingItem.name,
      characterName: editingItem.characterName,
      series: editingItem.series ?? undefined,
      model: editingItem.model ?? undefined,
      releaseDate: editingItem.releaseDate ? dayjs(editingItem.releaseDate) : undefined,
      officialPrice: Number(editingItem.officialPrice ?? 0) || undefined,
      tags: editingItem.tags?.join('，'),
      description: editingItem.description ?? undefined,
      images: toUploadedImages(editingItem.images),
    });
  }, [editingItem, form]);

  const saveMutation = useMutation({
    mutationFn: async (values: CatalogForm) => {
      const payload = {
        name: values.name,
        characterName: values.characterName,
        series: values.series,
        model: values.model,
        releaseDate: values.releaseDate?.toISOString(),
        officialPrice: values.officialPrice,
        tags: values.tags
          ? values.tags.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean)
          : [],
        description: values.description,
        images: toUploadedImages(values.images),
        coverImage: values.images?.[0]?.url,
      };
      const { data } = isEdit
        ? await http.patch<CatalogItem>(`/catalog/${id}`, payload)
        : await http.post<CatalogItem>('/catalog', payload);
      return data;
    },
    onSuccess: async (data) => {
      message.success(isEdit ? '图鉴已保存' : '图鉴已创建');
      await queryClient.invalidateQueries({ queryKey: ['catalog'] });
      navigate(`/catalog/${data.id}`);
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || '保存失败');
    },
  });

  if (isEdit && catalogQuery.isPending) {
    return (
      <>
        <PageHeader title="编辑图鉴" back />
        <EmptyState title="正在读取图鉴" />
      </>
    );
  }

  if (isEdit && editingItem && !canEdit) {
    return (
      <>
        <PageHeader title="编辑图鉴" back />
        <EmptyState
          title="只能编辑自己创建的图鉴"
          description="这条公共图鉴由其他用户创建，可以查看和添加到自己的收藏。"
          actionText="回到图鉴详情"
          onAction={() => navigate(`/catalog/${id}`)}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={isEdit ? '编辑图鉴' : '创建图鉴'}
        subtitle="名称和角色是必填信息，其余字段可稍后补充。"
        back
      />
      <Form<CatalogForm>
        form={form}
        layout="vertical"
        className="form-surface"
        onFinish={(values) => saveMutation.mutate(values)}
      >
        <Form.Item label="图片（最多 5 张）" name="images">
          <ImageUploader />
        </Form.Item>
        <Form.Item
          label="名称"
          name="name"
          validateTrigger="onBlur"
          rules={[{ required: true, whitespace: true, message: '名称不能为空' }]}
        >
          <Input size="large" placeholder="例如：粉色毛绒挂件" />
        </Form.Item>
        <Form.Item
          label="角色"
          name="characterName"
          rules={[{ required: true, whitespace: true, message: '角色不能为空' }]}
        >
          <Input size="large" placeholder="例如：玲娜贝儿" />
        </Form.Item>
        <Form.Item label="系列（选填）" name="series">
          <Input size="large" placeholder="例如：春日限定" />
        </Form.Item>
        <Form.Item label="型号（选填）" name="model">
          <Input size="large" placeholder="例如：SS 挂件" />
        </Form.Item>
        <Form.Item label="发售日期（选填）" name="releaseDate">
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="官方价格（选填）" name="officialPrice">
          <InputNumber min={0} prefix="¥" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="标签（选填）" name="tags">
          <Input size="large" placeholder="多个标签用逗号分隔，例如：限定，春季" />
        </Form.Item>
        <Form.Item label="简介（选填）" name="description">
          <Input.TextArea rows={4} placeholder="补充材质、尺寸或特别说明" />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={saveMutation.isPending}>
          保存
        </Button>
      </Form>
    </>
  );
}
