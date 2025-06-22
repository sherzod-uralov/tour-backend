import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service for handling file uploads
 */
@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {}

  /**
   * Get the base URL for file access
   * @returns The base URL for accessing uploaded files
   */
  private getFileBaseUrl(): string {
    // In a production environment, this might be a CDN URL
    // For local development, we use the application URL
    const host = this.configService.get('HOST', 'localhost');
    const port = this.configService.get('PORT', '3005');
    return `http://${host}:${port}/uploads`;
  }

  /**
   * Process an uploaded file and return its URL
   * @param file The uploaded file
   * @returns Object containing the file URL and m etadata
   */
  processUploadedFile(file: Express.Multer.File) {
    if (!file) {
      return null;
    }

    const fileUrl = `${this.getFileBaseUrl()}/${file.filename}`;

    return {
      originalname: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      url: fileUrl,
    };
  }

  /**
   * Process multiple uploaded files and return their URLs
   * @param files Array of uploaded files
   * @returns Array of objects containing file URLs and metadata
   */
  processUploadedFiles(files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      return [];
    }

    return files.map(file => this.processUploadedFile(file));
  }
}