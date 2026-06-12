import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ImageInputDto {
  @IsString()
  url!: string;

  @IsString()
  objectKey!: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  size?: number;
}
