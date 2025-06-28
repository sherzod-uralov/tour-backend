import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsDateString,
  IsEnum,
  IsArray,
  IsOptional,
  Min,
  IsBoolean,
} from 'class-validator';
import { TourCategory } from '../enums/tour-category.enum';
import { TourDifficulty } from '../enums/tour-difficulty.enum';
import { Type } from 'class-transformer';

export class CreateTourDto {
  @ApiProperty({
    example: 'Historical Tour of Samarkand',
    description: 'The title of the tour',
  })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ApiProperty({
    example:
      'Explore the ancient city of Samarkand with its rich history and architecture.',
    description: 'The description of the tour',
  })
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @ApiProperty({
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
    description: 'Array of image URLs for the tour',
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ message: 'At least one image is required' })
  images: string[];

  @ApiProperty({
    example: 'Samarkand, Uzbekistan',
    description: 'The location of the tour',
  })
  @IsString()
  @IsNotEmpty({ message: 'Location is required' })
  location: string;

  @ApiProperty({
    example: 299.99,
    description: 'The price of the tour',
  })
  @IsNumber()
  @Min(0, { message: 'Price must be a positive number' })
  @Type(() => Number)
  price: number;

  @ApiProperty({
    example: '2023-07-15',
    description: 'The start date of the tour (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsNotEmpty({ message: 'Start date is required' })
  startDate: string;

  @ApiProperty({
    example: '2023-07-22',
    description: 'The end date of the tour (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsNotEmpty({ message: 'End date is required' })
  endDate: string;

  @ApiProperty({
    example: 20,
    description: 'The number of available seats for the tour',
  })
  @IsNumber()
  @Min(1, { message: 'Available seats must be at least 1' })
  @Type(() => Number)
  availableSeats: number;

  @ApiProperty({
    example: 'historical',
    description: 'The category of the tour',
    enum: TourCategory,
  })
  @IsEnum(TourCategory, { message: 'Invalid tour category' })
  category: TourCategory;

  @ApiProperty({
    example: true,
    description: 'Whether the tour is active',
    default: true,
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
    example: 'moderate',
    description: 'The difficulty level of the tour',
    enum: TourDifficulty,
    required: false,
  })
  @IsEnum(TourDifficulty, { message: 'Invalid tour difficulty' })
  @IsOptional()
  difficulty?: TourDifficulty;

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
