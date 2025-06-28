import { IsNotEmpty, IsInt, Min, Max, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTourCommentDto {
  @ApiProperty({
    description: 'The comment text',
    example: 'This was an amazing tour! Highly recommended.',
  })
  @IsNotEmpty()
  @IsString()
  comment: string;

  @ApiProperty({
    description: 'Rating from 1 to 5 stars',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'The ID of the tour being commented on',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  tourId: number;
}
