import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class CreateUserDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email of the user',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'The password of the user',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @ApiProperty({
    example: 'John',
    description: 'The first name of the user',
  })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'The last name of the user',
  })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'The phone number of the user',
  })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  phoneNumber: string;

  @ApiProperty({
    example: 'tourist',
    description: 'The role of the user',
    enum: Role,
    default: Role.TOURIST,
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
