import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ImportExportService } from './import-export.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class ImportExportController {
  constructor(private readonly importExportService: ImportExportService) {}

  @Get('export/catalog')
  exportCatalog() {
    return this.importExportService.exportCatalog();
  }

  @Get('export/inventory')
  exportInventory(@CurrentUser() user: RequestUser) {
    return this.importExportService.exportInventory(user.id);
  }

  @Get('export/prices')
  exportPrices(@CurrentUser() user: RequestUser) {
    return this.importExportService.exportPrices(user.id);
  }

  @Post('import')
  importData(@CurrentUser() user: RequestUser, @Body() body: unknown) {
    return this.importExportService.importData(user.id, body);
  }
}
