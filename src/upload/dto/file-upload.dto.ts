import { ApiProperty } from '@nestjs/swagger';

export class FileUploadDto {
  @ApiProperty({
    description: 'Original name of the uploaded file',
    example: 'vacation-photo.jpg',
  })
  originalname: string;

  @ApiProperty({
    description: 'Generated filename on the server',
    example: '550e8400-e29b-41d4-a716-446655440000.jpg',
  })
  filename: string;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'image/jpeg',
  })
  mimetype: string;

  @ApiProperty({
    description: 'Size of the file in bytes',
    example: 1024000,
  })
  size: number;

  @ApiProperty({
    description: 'URL to access the uploaded file',
    example:
      'http://localhost:3005/uploads/550e8400-e29b-41d4-a716-446655440000.jpg',
  })
  url: string;
}

export class FilesUploadDto {
  @ApiProperty({
    description: 'Array of uploaded files',
    type: [FileUploadDto],
  })
  files: FileUploadDto[];
}
