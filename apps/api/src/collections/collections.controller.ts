import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CollectionStatus } from '@prisma/client';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  CreateCollectionDto,
  UpdateCollectionDto,
  UpdateCollectionStatusDto,
} from './dto/collection.dto';
import { CollectionsService } from './collections.service';

@UseGuards(JwtAuthGuard)
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  list(
    @CurrentUser() user: RequestUser,
    @Query('status') status?: CollectionStatus,
    @Query('series') series?: string,
    @Query('sort') sort?: string,
  ) {
    return this.collectionsService.list(user.id, { status, series, sort });
  }

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateCollectionDto) {
    return this.collectionsService.create(user.id, dto);
  }

  @Get(':id')
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.collectionsService.get(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateCollectionDto,
  ) {
    return this.collectionsService.update(user.id, id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateCollectionStatusDto,
  ) {
    return this.collectionsService.updateStatus(user.id, id, dto.status);
  }

  @Delete(':id')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.collectionsService.remove(user.id, id);
  }
}
