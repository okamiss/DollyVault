import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateSettingDto {
  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  defaultPosterTemplateId?: string | null;

  @IsOptional()
  @IsBoolean()
  showPurchasePrice?: boolean;

  @IsOptional()
  @IsBoolean()
  showFloatAmount?: boolean;

  @IsOptional()
  @IsBoolean()
  showSeriesInfo?: boolean;
}
