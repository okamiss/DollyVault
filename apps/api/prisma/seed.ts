import { PrismaClient, PosterTemplateKey } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const templates = [
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

  for (const template of templates) {
    await prisma.posterTemplate.upsert({
      where: { key: template.key },
      update: template,
      create: template,
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
