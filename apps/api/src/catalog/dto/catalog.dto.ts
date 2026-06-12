import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { ImageInputDto } from '../../common/dto/image-input.dto';

export class CreateCatalogDto {
  @IsString()
  @MinLength(1, { message: '名称不能为空' })
  @MaxLength(80)
  name!: string;

  @IsString()
  @MinLength(1, { message: '角色不能为空' })
  @MaxLength(60)
  characterName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  series?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  model?: string;

  @IsOptional()
  @IsDateString()
  releaseDate?: string;

  @IsOptional()
  officialPrice?: number;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => ImageInputDto)
  images?: ImageInputDto[];
}

export class UpdateCatalogDto extends PartialType(CreateCatalogDto) {}
