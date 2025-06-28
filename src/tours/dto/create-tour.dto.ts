import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsDateString,
  IsArray,
  IsOptional,
  Min,
  IsBoolean,
} from 'class-validator';
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
    example: 'Explore the ancient city of Samarkand...',
    description: 'The description of the tour',
  })
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @ApiProperty({
    example: ['https://example.com/image1.jpg'],
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
    description: 'Start date of the tour (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsNotEmpty({ message: 'Start date is required' })
  startDate: string;

  @ApiProperty({
    example: '2023-07-22',
    description: 'End date of the tour (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsNotEmpty({ message: 'End date is required' })
  endDate: string;

  @ApiProperty({
    example: 20,
    description: 'Available seats for the tour',
  })
  @IsNumber()
  @Min(1, { message: 'Available seats must be at least 1' })
  @Type(() => Number)
  availableSeats: number;

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
    description: 'Duration in days',
    required: false,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  duration?: number;

  @ApiProperty({
    example: 'Hotel accommodation, Breakfast, Guided tours...',
    description: 'Services included in the tour',
    required: false,
  })
  @IsString()
  @IsOptional()
  includedServices?: string;

  @ApiProperty({
    example: 'Flights, Personal expenses',
    description: 'Services excluded from the tour',
    required: false,
  })
  @IsString()
  @IsOptional()
  excludedServices?: string;

  @ApiProperty({
    example: 'Day 1: Arrival and city tour...',
    description: 'Detailed itinerary',
    required: false,
  })
  @IsString()
  @IsOptional()
  itinerary?: string;

  @ApiProperty({
    example: 'Tashkent International Airport',
    description: 'Meeting point',
    required: false,
  })
  @IsString()
  @IsOptional()
  meetingPoint?: string;

  @ApiProperty({
    example: 'Tashkent International Airport',
    description: 'End point of the tour',
    required: false,
  })
  @IsString()
  @IsOptional()
  endPoint?: string;

  @ApiProperty({
    example: '536690',
    description: 'Lemon Squeezy product ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  lemonSqueezyProductId?: string;

  @ApiProperty({
    example: '536690',
    description: 'Lemon Squeezy variant ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  lemonSqueezyVariantId?: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the category entity',
    required: true,
  })
  @IsNumber()
  @Type(() => Number)
  categoryId: number;

  @ApiProperty({
    example: 2,
    description: 'ID of the difficulty entity',
    required: true,
  })
  @IsNumber()
  @Type(() => Number)
  difficultyId: number;
}
