import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreatePriceRecordDto } from './dto/price-record.dto';
import { PriceRecordsService } from './price-records.service';

@UseGuards(JwtAuthGuard)
@Controller('price-records')
export class PriceRecordsController {
  constructor(private readonly priceRecordsService: PriceRecordsService) {}

  @Get()
  list(@Query('catalogItemId') catalogItemId?: string) {
    return this.priceRecordsService.list(catalogItemId);
  }

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreatePriceRecordDto) {
    return this.priceRecordsService.create(user.id, dto);
  }
}
