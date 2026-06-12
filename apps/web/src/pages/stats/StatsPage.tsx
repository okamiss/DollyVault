import { Card, Col, Row, Statistic } from 'antd';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { http } from '../../shared/api/http';
import { EChart } from '../../shared/components/EChart';
import { EmptyState } from '../../shared/components/EmptyState';
import { PageHeader } from '../../shared/components/PageHeader';
import type { Statistics } from '../../shared/types';
import type { EChartsOption } from 'echarts';
import { money } from '../../shared/utils';

export function StatsPage() {
  const statsQuery = useQuery({
    queryKey: ['statistics'],
    queryFn: async () => {
      const { data } = await http.get<Statistics>('/statistics');
      return data;
    },
  });
  const stats = statsQuery.data;

  const distributionOption = useMemo<EChartsOption>(
    () => ({
      color: ['#ff5c9a', '#7c5cff', '#25c2a0', '#f6b44b'],
      tooltip: { trigger: 'item' as const },
      series: [
        {
          type: 'pie' as const,
          radius: ['48%', '72%'],
          data: stats?.byCharacter ?? [],
        },
      ],
    }),
    [stats],
  );

  const trendOption = useMemo<EChartsOption>(
    () => ({
      color: ['#ff5c9a', '#4f8cff'],
      tooltip: { trigger: 'axis' as const },
      xAxis: { type: 'category' as const, data: stats?.monthlyPurchaseTrend.map((item) => item.month) ?? [] },
      yAxis: { type: 'value' as const },
      series: [
        {
          name: '入手金额',
          type: 'line' as const,
          smooth: true,
          data: stats?.monthlyPurchaseTrend.map((item) => item.value) ?? [],
        },
        {
          name: '估值',
          type: 'line' as const,
          smooth: true,
          data: stats?.monthlyEstimatedTrend.map((item) => item.value) ?? [],
        },
      ],
    }),
    [stats],
  );

  return (
    <>
      <PageHeader
        title="收藏统计"
        subtitle="统计基于你录入的价格与入手信息，仅用于个人整理。"
      />
      {!stats || stats.totalCount === 0 ? (
        <EmptyState title="暂无持有中的藏品" description="添加库存后即可查看收藏汇总。" />
      ) : (
        <>
          <Row gutter={[12, 12]}>
            <Col xs={12} md={6}>
              <Card>
                <Statistic title="总数量" value={stats.totalCount} suffix="只" />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card>
                <Statistic title="入手合计" value={stats.purchaseTotal} formatter={() => money(stats.purchaseTotal)} />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card>
                <Statistic title="估值合计" value={stats.estimatedTotal} formatter={() => money(stats.estimatedTotal)} />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card>
                <Statistic title="浮动比例" value={stats.floatRatio * 100} precision={1} suffix="%" />
              </Card>
            </Col>
          </Row>
          <div className="chart-grid">
            <Card title="按角色分布">
              <EChart option={distributionOption} />
            </Card>
            <Card title="入手与估值趋势">
              <EChart option={trendOption} />
            </Card>
          </div>
        </>
      )}
    </>
  );
}
