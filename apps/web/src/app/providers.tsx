import { PropsWithChildren } from 'react';
import { App as AntApp, ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../shared/api/queryClient';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: '#ff5c9a',
            borderRadius: 12,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          },
          components: {
            Button: {
              borderRadius: 12,
              controlHeight: 42,
            },
            Card: {
              borderRadiusLG: 16,
            },
          },
        }}
      >
        <AntApp>{children}</AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
