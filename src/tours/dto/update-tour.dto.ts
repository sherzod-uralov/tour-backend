import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsDateString,
  IsArray,
  IsOptional,
  Min,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTourDto {
  @ApiProperty({
    example: 'Historical Tour of Samarkand',
    description: 'The title of the tour',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    example:
      'Explore the ancient city of Samarkand with its rich history and architecture.',
    description: 'The description of the tour',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
    description: 'Array of image URLs for the tour',
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiProperty({
    example: 'Samarkand, Uzbekistan',
    description: 'The location of the tour',
    required: false,
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    example: 299.99,
    description: 'The price of the tour',
    required: false,
  })
  @IsNumber()
  @Min(0, { message: 'Price must be a positive number' })
  @IsOptional()
  @Type(() => Number)
  price?: number;

  @ApiProperty({
    example: '2023-07-15',
    description: 'The start date of the tour (YYYY-MM-DD)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    example: '2023-07-22',
    description: 'The end date of the tour (YYYY-MM-DD)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({
    example: 20,
    description: 'The number of available seats for the tour',
    required: false,
  })
  @IsNumber()
  @Min(1, { message: 'Available seats must be at least 1' })
  @IsOptional()
  @Type(() => Number)
  availableSeats?: number;

  @ApiProperty({
    example: true,
    description: 'Whether the tour is active',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    example: 7,
    description: 'The duration of the tour in days',
    required: false,
  })
  @IsNumber()
  @Min(1, { message: 'Duration must be at least 1 day' })
  @IsOptional()
  @Type(() => Number)
  duration?: number;

  @ApiProperty({
    example: 'Hotel accommodation, Breakfast, Guided tours, Transportation',
    description: 'Services included in the tour',
    required: false,
  })
  @IsString()
  @IsOptional()
  includedServices?: string;

  @ApiProperty({
    example: 'Flights, Lunch and Dinner, Personal expenses',
    description: 'Services excluded from the tour',
    required: false,
  })
  @IsString()
  @IsOptional()
  excludedServices?: string;

  @ApiProperty({
    example: 'Day 1: Arrival and city tour. Day 2: Visit to Registan Square...',
    description: 'Detailed itinerary of the tour',
    required: false,
  })
  @IsString()
  @IsOptional()
  itinerary?: string;

  @ApiProperty({
    example: 'Tashkent International Airport',
    description: 'The meeting point for the tour',
    required: false,
  })
  @IsString()
  @IsOptional()
  meetingPoint?: string;

  @ApiProperty({
    example: 'Tashkent International Airport',
    description: 'The end point of the tour',
    required: false,
  })
  @IsString()
  @IsOptional()
  endPoint?: string;

  @ApiProperty({
    example: '536690',
    description: 'The Lemon Squeezy product ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  lemonSqueezyProductId?: string;

  @ApiProperty({
    example: '536690',
    description: 'The Lemon Squeezy variant ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  lemonSqueezyVariantId?: string;

  @ApiProperty({
    example: 1,
    description: 'The ID of the category entity',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  categoryId?: number;

  @ApiProperty({
    example: 1,
    description: 'The ID of the difficulty entity',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  difficultyId?: number;
}
