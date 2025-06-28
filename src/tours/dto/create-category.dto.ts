import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Historical',
    description: 'The name of the category',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({
    example: 'historical-tours',
    description: 'The URL-friendly identifier for the category',
  })
  @IsString()
  @IsNotEmpty({ message: 'Category URL is required' })
  categoryUrl: string;

  @ApiProperty({
    example: 'Tours focused on historical sites and events',
    description: 'A description of the category',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
