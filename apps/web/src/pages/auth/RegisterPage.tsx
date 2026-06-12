import { Button, Form, Input, Typography, App as AntApp } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { http } from '../../shared/api/http';
import { useAuthStore } from '../../shared/stores/authStore';
import type { AuthResponse } from '../../shared/types';

interface RegisterForm {
  username: string;
  nickname?: string;
  password: string;
  confirm: string;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { message } = AntApp.useApp();
  const setAuth = useAuthStore((state) => state.setAuth);

  const registerMutation = useMutation({
    mutationFn: async (values: RegisterForm) => {
      const { data } = await http.post<AuthResponse>('/auth/register', {
        username: values.username,
        nickname: values.nickname,
        password: values.password,
      });
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
      navigate('/', { replace: true });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || '注册失败');
    },
  });

  return (
    <div className="auth-card">
      <Typography.Title level={2}>创建账号</Typography.Title>
      <Typography.Paragraph type="secondary">
        第一版使用普通账号登录，不需要邮箱。
      </Typography.Paragraph>
      <Form<RegisterForm>
        layout="vertical"
        onFinish={(values) => registerMutation.mutate(values)}
      >
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
        <Form.Item label="昵称" name="nickname">
          <Input size="large" placeholder="例如：贝儿收藏家" />
        </Form.Item>
        <Form.Item
          label="密码"
          name="password"
          rules={[{ required: true, min: 6, message: '密码至少需要 6 位' }]}
        >
          <Input.Password size="large" autoComplete="new-password" />
        </Form.Item>
        <Form.Item
          label="确认密码"
          name="confirm"
          dependencies={['password']}
          rules={[
            { required: true, message: '请再次输入密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password size="large" autoComplete="new-password" />
        </Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          loading={registerMutation.isPending}
        >
          注册并进入
        </Button>
      </Form>
      <p className="auth-switch">
        已经有账号？ <Link to="/login">去登录</Link>
      </p>
    </div>
  );
}
