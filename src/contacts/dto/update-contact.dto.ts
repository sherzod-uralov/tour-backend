import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateContactDto {
  @ApiProperty({
    example: 'Updated question about tour availability',
    description: 'The updated subject of the contact inquiry',
    required: false,
  })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({
    example: 'Updated message about tour availability',
    description: 'The updated message content of the contact inquiry',
    required: false,
  })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the contact inquiry has been resolved',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isResolved?: boolean;
}