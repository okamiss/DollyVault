import { Button, Space } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, back, action }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <header className="page-header">
      <Space align="center">
        {back && (
          <Button
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate(-1)}
            aria-label="返回"
          />
        )}
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </Space>
      {action}
    </header>
  );
}
