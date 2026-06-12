import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StatisticsService } from './statistics.service';

@UseGuards(JwtAuthGuard)
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  get(@CurrentUser() user: RequestUser) {
    return this.statisticsService.get(user.id);
  }
}
