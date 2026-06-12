import { Button } from 'antd';
import { Heart } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Heart size={30} />
      </div>
      <strong>{title}</strong>
      {description && <span>{description}</span>}
      {actionText && onAction && (
        <Button type="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
