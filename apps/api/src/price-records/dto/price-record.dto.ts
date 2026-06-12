import { IsDateString, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreatePriceRecordDto {
  @IsString()
  catalogItemId!: string;

  @Min(0)
  price!: number;

  @IsOptional()
  @IsDateString()
  recordDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  source?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
