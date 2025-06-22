import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          // Generate a unique filename with original extension
          const uniqueSuffix = uuidv4();
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        // Allow only images and PDFs
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf)$/)) {
          return callback(new Error('Only image files and PDFs are allowed!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
      },
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}