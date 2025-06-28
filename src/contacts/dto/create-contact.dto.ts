import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateContactDto {
  @ApiProperty({
    example: 'Question about tour availability',
    description: 'The subject of the contact inquiry',
  })
  @IsString()
  @IsNotEmpty({ message: 'Subject is required' })
  subject: string;

  @ApiProperty({
    example: 'I would like to know if there are still available seats for the Samarkand tour in July.',
    description: 'The message content of the contact inquiry',
  })
  @IsString()
  @IsNotEmpty({ message: 'Message is required' })
  message: string;
}