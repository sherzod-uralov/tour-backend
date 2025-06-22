import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsOptional,
  Min,
  IsEmail,
  IsPhoneNumber,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BookingStatus } from '../entities/booking.entity';

export class UpdateBookingDto {
  @ApiProperty({
    example: 2,
    description: 'The number of people for the booking',
    required: false,
  })
  @IsNumber()
  @Min(1, { message: 'Number of people must be at least 1' })
  @IsOptional()
  @Type(() => Number)
  numberOfPeople?: number;

  @ApiProperty({
    example: 'Vegetarian meals required, Airport pickup needed',
    description: 'Any special requests for the booking',
    required: false,
  })
  @IsString()
  @IsOptional()
  specialRequests?: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Contact phone number for the booking',
    required: false,
  })
  @IsString()
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  @IsOptional()
  contactPhone?: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Contact email for the booking',
    required: false,
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  contactEmail?: string;

  @ApiProperty({
    example: 'confirmed',
    description: 'The status of the booking',
    enum: BookingStatus,
    required: false,
  })
  @IsEnum(BookingStatus, { message: 'Invalid booking status' })
  @IsOptional()
  status?: BookingStatus;

  @ApiProperty({
    example: 'pay_123456789',
    description: 'The payment ID for the booking',
    required: false,
  })
  @IsString()
  @IsOptional()
  paymentId?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the booking has been paid for',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;
}
