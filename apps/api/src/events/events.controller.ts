import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { EventsService } from './events.service';

@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  list(@CurrentUser() user: RequestUser, @Query('collectionItemId') collectionItemId?: string) {
    return this.eventsService.list(user.id, collectionItemId);
  }
}
