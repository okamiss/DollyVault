import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { PriceRecordsController } from './price-records.controller';
import { PriceRecordsService } from './price-records.service';

@Module({
  imports: [EventsModule],
  controllers: [PriceRecordsController],
  providers: [PriceRecordsService],
})
export class PriceRecordsModule {}
