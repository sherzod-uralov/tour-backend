import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  Min,
  IsEmail,
  IsPhoneNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @ApiProperty({
    example: 1,
    description: 'The ID of the tour to book',
  })
  @IsNumber()
  @Type(() => Number)
  tourId: number;

  @ApiProperty({
    example: 2,
    description: 'The number of people for the booking',
  })
  @IsNumber()
  @Min(1, { message: 'Number of people must be at least 1' })
  @Type(() => Number)
  numberOfPeople: number;

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
  })
  @IsString()
  @IsNotEmpty({ message: 'Contact phone is required' })
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  contactPhone: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Contact email for the booking',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Contact email is required' })
  contactEmail: string;
}
