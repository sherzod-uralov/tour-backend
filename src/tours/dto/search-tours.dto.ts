import { IsOptional, IsString, IsNumber, IsEnum, IsDate, Min, Max, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TourCategory } from '../enums/tour-category.enum';
import { TourDifficulty } from '../enums/tour-difficulty.enum';

export class SearchToursDto {
  @ApiProperty({
    description: 'Search term for tour title or description',
    required: false,
    example: 'beach',
  })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @ApiProperty({
    description: 'Location to search for',
    required: false,
    example: 'Samarkand',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Minimum price',
    required: false,
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minPrice?: number;

  @ApiProperty({
    description: 'Maximum price',
    required: false,
    example: 1000,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  maxPrice?: number;

  @ApiProperty({
    description: 'Start date (format: YYYY-MM-DD)',
    required: false,
    example: '2023-07-01',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiProperty({
    description: 'End date (format: YYYY-MM-DD)',
    required: false,
    example: '2023-07-31',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiProperty({
    description: 'Minimum duration in days',
    required: false,
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  minDuration?: number;

  @ApiProperty({
    description: 'Maximum duration in days',
    required: false,
    example: 14,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  maxDuration?: number;

  @ApiProperty({
    description: 'Tour category',
    required: false,
    enum: TourCategory,
    example: TourCategory.ADVENTURE,
  })
  @IsOptional()
  @IsEnum(TourCategory)
  category?: TourCategory;

  @ApiProperty({
    description: 'Tour difficulty',
    required: false,
    enum: TourDifficulty,
    example: TourDifficulty.MODERATE,
  })
  @IsOptional()
  @IsEnum(TourDifficulty)
  difficulty?: TourDifficulty;

  @ApiProperty({
    description: 'Minimum number of available seats',
    required: false,
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  minAvailableSeats?: number;

  @ApiProperty({
    description: 'Page number for pagination',
    required: false,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(50)
  limit?: number = 10;
}