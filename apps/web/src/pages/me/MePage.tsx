import { Button, Card, Form, Input, Radio, Space, Switch, Upload, App as AntApp } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { http } from '../../shared/api/http';
import { PageHeader } from '../../shared/components/PageHeader';
import { useAuthStore } from '../../shared/stores/authStore';
import type { CurrentUser } from '../../shared/types';

interface Setting {
  currency: string;
  showPurchasePrice: boolean;
  showFloatAmount: boolean;
  showSeriesInfo: boolean;
}

export function MePage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message } = AntApp.useApp();

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data } = await http.get<Setting>('/settings');
      return data;
    },
  });

  const profileMutation = useMutation({
    mutationFn: async (values: Partial<CurrentUser>) => {
      const { data } = await http.patch<CurrentUser>('/users/me', values);
      return data;
    },
    onSuccess: (data) => {
      setUser(data);
      message.success('账号信息已保存');
    },
  });

  const settingsMutation = useMutation({
    mutationFn: async (values: Partial<Setting>) => {
      const { data } = await http.patch<Setting>('/settings', values);
      return data;
    },
    onSuccess: async () => {
      message.success('偏好已保存');
      await queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const downloadJson = async (url: string, filename: string) => {
    const { data } = await http.get(url);
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(href);
  };

  return (
    <>
      <PageHeader title="我的" subtitle="账号、偏好、导入导出和关于 DollyVault。" />
      <div className="settings-grid">
        <Card title="账号信息">
          <Form
            layout="vertical"
            initialValues={user ?? undefined}
            onFinish={(values) => profileMutation.mutate(values)}
          >
            <Form.Item label="用户名">
              <Input value={user?.username} disabled />
            </Form.Item>
            <Form.Item label="昵称" name="nickname">
              <Input placeholder="你的收藏昵称" />
            </Form.Item>
            <Form.Item label="头像 URL" name="avatarUrl">
              <Input placeholder="可填写 OSS 图片 URL" />
            </Form.Item>
            <Form.Item label="简介" name="bio">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={profileMutation.isPending}>
              保存账号信息
            </Button>
          </Form>
        </Card>

        <Card title="偏好设置">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div className="setting-row">
              <span>货币单位</span>
              <Radio.Group value="CNY">
                <Radio.Button value="CNY">CNY (¥)</Radio.Button>
              </Radio.Group>
            </div>
            <div className="setting-row">
              <span>显示购入价</span>
              <Switch
                checked={settingsQuery.data?.showPurchasePrice}
                onChange={(checked) => settingsMutation.mutate({ showPurchasePrice: checked })}
              />
            </div>
            <div className="setting-row">
              <span>显示浮动金额</span>
              <Switch
                checked={settingsQuery.data?.showFloatAmount}
                onChange={(checked) => settingsMutation.mutate({ showFloatAmount: checked })}
              />
            </div>
            <div className="setting-row">
              <span>显示系列信息</span>
              <Switch
                checked={settingsQuery.data?.showSeriesInfo}
                onChange={(checked) => settingsMutation.mutate({ showSeriesInfo: checked })}
              />
            </div>
          </Space>
        </Card>

        <Card title="数据管理">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button block onClick={() => downloadJson('/export/catalog', 'dollyvault-catalog.json')}>
              导出图鉴 JSON
            </Button>
            <Button block onClick={() => downloadJson('/export/inventory', 'dollyvault-inventory.json')}>
              导出库存 JSON
            </Button>
            <Button block onClick={() => downloadJson('/export/prices', 'dollyvault-prices.json')}>
              导出价格记录 JSON
            </Button>
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button block icon={<UploadOutlined />}>导入数据</Button>
            </Upload>
          </Space>
        </Card>

        <Card title="帮助">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button block onClick={() => navigate('/catalog')}>
              新手引导
            </Button>
            <Button block onClick={() => message.info('DollyVault v0.1.0')}>
              关于 DollyVault
            </Button>
            <Button danger block onClick={handleLogout}>
              退出登录
            </Button>
          </Space>
        </Card>
      </div>
    </>
  );
}
