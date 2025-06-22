import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  Matches,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class UpdateUserDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email of the user',
    required: false,
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'The password of the user',
    required: false,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  @IsOptional()
  password?: string;

  @ApiProperty({
    example: 'John',
    description: 'The first name of the user',
    required: false,
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'The last name of the user',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'The phone number of the user',
    required: false,
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    example: 'tourist',
    description: 'The role of the user',
    enum: Role,
    required: false,
  })
  @IsEnum(Role, { message: 'Role must be either admin or tourist' })
  @IsOptional()
  role?: string;

  @ApiProperty({
    example: 'https://example.com/profile.jpg',
    description: 'The profile picture URL of the user',
    required: false,
  })
  @IsString()
  @IsOptional()
  profilePicture?: string;

  @ApiProperty({
    example: '123 Main St',
    description: 'The address of the user',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    example: 'New York',
    description: 'The city of the user',
    required: false,
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({
    example: 'USA',
    description: 'The country of the user',
    required: false,
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({
    example: '10001',
    description: 'The postal code of the user',
    required: false,
  })
  @IsString()
  @IsOptional()
  postalCode?: string;
}
