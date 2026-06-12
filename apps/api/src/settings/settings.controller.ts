import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { SettingsService } from './settings.service';

@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  get(@CurrentUser() user: RequestUser) {
    return this.settingsService.get(user.id);
  }

  @Patch()
  update(@CurrentUser() user: RequestUser, @Body() dto: UpdateSettingDto) {
    return this.settingsService.update(user.id, dto);
  }
}
