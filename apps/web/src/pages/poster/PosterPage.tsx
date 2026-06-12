import { Button, Card, Select, Space } from 'antd';
import { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toPng } from 'html-to-image';
import { Download } from 'lucide-react';
import { http } from '../../shared/api/http';
import { EmptyState } from '../../shared/components/EmptyState';
import { PageHeader } from '../../shared/components/PageHeader';
import type { CollectionItem, PosterTemplate } from '../../shared/types';
import { estimateFor, itemImage, money } from '../../shared/utils';

export function PosterPage() {
  const posterRef = useRef<HTMLDivElement | null>(null);
  const [collectionId, setCollectionId] = useState<string>();
  const [templateKey, setTemplateKey] = useState<PosterTemplate['key']>('Minimal');

  const collectionsQuery = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const { data } = await http.get<CollectionItem[]>('/collections');
      return data;
    },
  });
  const templatesQuery = useQuery({
    queryKey: ['poster-templates'],
    queryFn: async () => {
      const { data } = await http.get<PosterTemplate[]>('/posters/templates');
      return data;
    },
  });

  const collections = collectionsQuery.data ?? [];
  const selected = collections.find((item) => item.id === collectionId) ?? collections[0];
  const templates = templatesQuery.data ?? [];
  const selectedTemplate = templates.find((item) => item.key === templateKey) ?? templates[0];

  const floatAmount = useMemo(() => {
    if (!selected) return 0;
    return Number(estimateFor(selected)) - Number(selected.purchasePrice ?? 0);
  }, [selected]);

  const download = async () => {
    if (!posterRef.current || !selected) return;
    const dataUrl = await toPng(posterRef.current, { pixelRatio: 2, cacheBust: true });
    const link = document.createElement('a');
    link.download = `DollyVault-${selected.catalogItem.name}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <>
      <PageHeader title="生成海报" subtitle="选择藏品和模板，下载 PNG 分享图。" />
      {collections.length === 0 ? (
        <EmptyState title="暂无可生成海报的藏品" description="先把图鉴商品添加到我的收藏。" />
      ) : (
        <div className="poster-workspace">
          <Card className="poster-controls">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Select
                value={selected?.id}
                onChange={setCollectionId}
                options={collections.map((item) => ({
                  label: item.catalogItem.name,
                  value: item.id,
                }))}
              />
              <Select
                value={templateKey}
                onChange={setTemplateKey}
                options={(templates.length ? templates : [
                  { key: 'Minimal', name: '简约风格' },
                  { key: 'CutePink', name: '可爱粉色风格' },
                  { key: 'CollectionCard', name: '收藏卡片风格' },
                  { key: 'Vintage', name: '复古风格' },
                ] as PosterTemplate[]).map((item) => ({
                  label: item.name,
                  value: item.key,
                }))}
              />
              <Button type="primary" icon={<Download size={16} />} onClick={download}>
                下载 PNG
              </Button>
            </Space>
          </Card>
          {selected && (
            <div className="poster-preview-wrap">
              <div
                ref={posterRef}
                className={`poster-preview poster-${selectedTemplate?.key ?? templateKey}`}
              >
                <div className="poster-kicker">My Collection</div>
                <img src={itemImage(selected) || undefined} alt={selected.catalogItem.name} />
                <h2>{selected.catalogItem.name}</h2>
                <p>{selected.catalogItem.characterName} · {selected.catalogItem.series || 'DollyVault'}</p>
                <div className="poster-price-box">
                  <span>当前估值</span>
                  <strong>{money(estimateFor(selected))}</strong>
                  <em>{floatAmount >= 0 ? '+' : ''}{money(floatAmount)}</em>
                </div>
                <div className="poster-logo">DollyVault</div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
