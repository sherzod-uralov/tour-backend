import {
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  Min,
  Max,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TourCategory } from '../../tours/enums/tour-category.enum';
import { TourDifficulty } from '../../tours/enums/tour-difficulty.enum';

export class UpdatePreferencesDto {
  @ApiProperty({
    description: 'Preferred tour categories',
    required: false,
    enum: TourCategory,
    isArray: true,
    example: [TourCategory.ADVENTURE, TourCategory.CULTURAL],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(TourCategory, { each: true })
  preferredCategories?: TourCategory[];

  @ApiProperty({
    description: 'Preferred tour difficulties',
    required: false,
    enum: TourDifficulty,
    isArray: true,
    example: [TourDifficulty.EASY, TourDifficulty.MODERATE],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(TourDifficulty, { each: true })
  preferredDifficulties?: TourDifficulty[];

  @ApiProperty({
    description: 'Preferred minimum price',
    required: false,
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  preferredMinPrice?: number;

  @ApiProperty({
    description: 'Preferred maximum price',
    required: false,
    example: 1000,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  preferredMaxPrice?: number;

  @ApiProperty({
    description: 'Preferred locations',
    required: false,
    isArray: true,
    example: ['Samarkand', 'Bukhara'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredLocations?: string[];

  @ApiProperty({
    description: 'Preferred minimum duration in days',
    required: false,
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  preferredMinDuration?: number;

  @ApiProperty({
    description: 'Preferred maximum duration in days',
    required: false,
    example: 14,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  preferredMaxDuration?: number;
}
