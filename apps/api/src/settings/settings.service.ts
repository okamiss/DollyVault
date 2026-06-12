import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  get(userId: string) {
    return this.prisma.userSetting.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: { defaultPosterTemplate: true },
    });
  }

  update(userId: string, dto: UpdateSettingDto) {
    return this.prisma.userSetting.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: dto,
      include: { defaultPosterTemplate: true },
    });
  }
}
