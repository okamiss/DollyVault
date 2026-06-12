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
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CatalogService } from './catalog.service';
import { CreateCatalogDto, UpdateCatalogDto } from './dto/catalog.dto';

@UseGuards(JwtAuthGuard)
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  list(@Query('search') search?: string) {
    return this.catalogService.list(search);
  }

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateCatalogDto) {
    return this.catalogService.create(user.id, dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.catalogService.get(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCatalogDto) {
    return this.catalogService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.catalogService.remove(id);
  }
}
