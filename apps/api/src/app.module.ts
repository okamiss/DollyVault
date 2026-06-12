import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { CollectionsModule } from './collections/collections.module';
import { EventsModule } from './events/events.module';
import { ImportExportModule } from './import-export/import-export.module';
import { PostersModule } from './posters/posters.module';
import { PriceRecordsModule } from './price-records/price-records.module';
import { PrismaModule } from './prisma/prisma.module';
import { SettingsModule } from './settings/settings.module';
import { StatisticsModule } from './statistics/statistics.module';
import { UploadsModule } from './uploads/uploads.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SettingsModule,
    UploadsModule,
    CatalogModule,
    CollectionsModule,
    PriceRecordsModule,
    StatisticsModule,
    EventsModule,
    PostersModule,
    ImportExportModule,
  ],
})
export class AppModule {}
