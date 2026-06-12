import { Injectable } from '@nestjs/common';
import { PosterTemplateKey } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const FALLBACK_TEMPLATES = [
  {
    key: PosterTemplateKey.Minimal,
    name: '简约风格',
    description: '留白、清爽、突出藏品本身',
  },
  {
    key: PosterTemplateKey.CutePink,
    name: '可爱粉色风格',
    description: '粉色渐变和圆角卡片，适合娃娃收藏',
  },
  {
    key: PosterTemplateKey.CollectionCard,
    name: '收藏卡片风格',
    description: '深色卡片与价格信息块',
  },
  {
    key: PosterTemplateKey.Vintage,
    name: '复古风格',
    description: '暖色纸感边框，适合纪念款分享',
  },
];

@Injectable()
export class PostersService {
  constructor(private readonly prisma: PrismaService) {}

  async templates() {
    const templates = await this.prisma.posterTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
    return templates.length > 0 ? templates : FALLBACK_TEMPLATES;
  }
}
