import { Card, Timeline } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { http } from '../../shared/api/http';
import { EmptyState } from '../../shared/components/EmptyState';
import { PageHeader } from '../../shared/components/PageHeader';
import type { CollectionEvent } from '../../shared/types';
import { dateText } from '../../shared/utils';

export function TimelinePage() {
  const eventsQuery = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data } = await http.get<CollectionEvent[]>('/events');
      return data;
    },
  });

  const events = eventsQuery.data ?? [];

  return (
    <>
      <PageHeader title="收藏历史" subtitle="按时间线回顾所有交易与编辑记录。" back />
      <Card>
        {events.length === 0 ? (
          <EmptyState title="暂无交易记录" description="购入藏品或录入价格后，这里会展示历史。" />
        ) : (
          <Timeline
            items={events.map((event) => ({
              color: event.type === 'Deleted' ? 'red' : 'pink',
              children: (
                <div className="timeline-item">
                  <strong>{event.title}</strong>
                  <span>{dateText(event.createdAt)}</span>
                </div>
              ),
            }))}
          />
        )}
      </Card>
    </>
  );
}
