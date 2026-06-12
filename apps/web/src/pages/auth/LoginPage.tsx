import { Button, Form, Input, Typography, App as AntApp } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { http } from '../../shared/api/http';
import { useAuthStore } from '../../shared/stores/authStore';
import type { AuthResponse } from '../../shared/types';

interface LoginForm {
  username: string;
  password: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = AntApp.useApp();
  const setAuth = useAuthStore((state) => state.setAuth);
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/';

  const loginMutation = useMutation({
    mutationFn: async (values: LoginForm) => {
      const { data } = await http.post<AuthResponse>('/auth/login', values);
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
      navigate(from, { replace: true });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || '登录失败');
    },
  });

  return (
    <div className="auth-card">
      <Typography.Title level={2}>欢迎回来</Typography.Title>
      <Typography.Paragraph type="secondary">
        用你的 DollyVault 账号继续整理收藏。
      </Typography.Paragraph>
      <Form<LoginForm> layout="vertical" onFinish={(values) => loginMutation.mutate(values)}>
        <Form.Item
          label="用户名"
          name="username"
          rules={[
            { required: true, message: '请输入用户名' },
            {
              pattern: /^[A-Za-z0-9_]{4,20}$/,
              message: '用户名只能包含英文、数字、下划线，长度 4-20 位',
            },
          ]}
        >
          <Input size="large" placeholder="dolly_fan" autoComplete="username" />
        </Form.Item>
        <Form.Item
          label="密码"
          name="password"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password size="large" autoComplete="current-password" />
        </Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          loading={loginMutation.isPending}
        >
          登录
        </Button>
      </Form>
      <p className="auth-switch">
        还没有账号？ <Link to="/register">注册一个</Link>
      </p>
    </div>
  );
}
