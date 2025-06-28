import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateDifficultyDto {
  @ApiProperty({
    example: 'Moderate',
    description: 'The name of the difficulty level',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({
    example: 'Suitable for people with average fitness level',
    description: 'A description of the difficulty level',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}