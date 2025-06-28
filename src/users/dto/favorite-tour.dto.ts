import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FavoriteTourDto {
  @ApiProperty({
    description: 'The ID of the tour to favorite',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  tourId: number;
}