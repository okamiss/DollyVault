import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { CollectionCondition, CollectionStatus } from '@prisma/client';
import { ImageInputDto } from '../../common/dto/image-input.dto';

export class CreateCollectionDto {
  @IsString()
  catalogItemId!: string;

  @IsOptional()
  purchasePrice?: number;

  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  purchaseChannel?: string;

  @IsOptional()
  @IsEnum(CollectionCondition)
  condition?: CollectionCondition;

  @IsOptional()
  @IsEnum(CollectionStatus)
  status?: CollectionStatus;

  @IsOptional()
  estimatedPrice?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => ImageInputDto)
  images?: ImageInputDto[];
}

export class UpdateCollectionDto extends PartialType(CreateCollectionDto) {}

export class UpdateCollectionStatusDto {
  @IsEnum(CollectionStatus)
  status!: CollectionStatus;
}
