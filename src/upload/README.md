# Upload Module

This module provides file upload functionality for the application. It allows users to upload files (images and PDFs) and returns URLs that can be used to access the uploaded files.

## Features

- Single file upload
- Multiple file upload (up to 10 files)
- File validation (only images and PDFs allowed)
- File size limitation (max 5MB per file)
- Secure file storage with unique filenames
- Authentication required for all upload endpoints

## API Endpoints

### Upload a Single File

```
POST /api/upload/file
```

**Headers:**
- Authorization: Bearer {token}
- Content-Type: multipart/form-data

**Form Data:**
- file: The file to upload

**Response:**
```json
{
  "originalname": "vacation-photo.jpg",
  "filename": "550e8400-e29b-41d4-a716-446655440000.jpg",
  "mimetype": "image/jpeg",
  "size": 1024000,
  "url": "http://localhost:3005/uploads/550e8400-e29b-41d4-a716-446655440000.jpg"
}
```

### Upload Multiple Files

```
POST /api/upload/files
```

**Headers:**
- Authorization: Bearer {token}
- Content-Type: multipart/form-data

**Form Data:**
- files: Array of files to upload (up to 10)

**Response:**
```json
{
  "files": [
    {
      "originalname": "vacation-photo1.jpg",
      "filename": "550e8400-e29b-41d4-a716-446655440000.jpg",
      "mimetype": "image/jpeg",
      "size": 1024000,
      "url": "http://localhost:3005/uploads/550e8400-e29b-41d4-a716-446655440000.jpg"
    },
    {
      "originalname": "vacation-photo2.jpg",
      "filename": "650e8400-e29b-41d4-a716-446655440000.jpg",
      "mimetype": "image/jpeg",
      "size": 1024000,
      "url": "http://localhost:3005/uploads/650e8400-e29b-41d4-a716-446655440000.jpg"
    }
  ]
}
```

## Usage in Other Services

You can use the returned URLs in other services, such as when creating or updating a tour or user profile. For example:

```typescript
// In a tour service
async updateTourImage(tourId: number, imageUrl: string): Promise<Tour> {
  const tour = await this.findOne(tourId);
  
  // Add the new image URL to the tour's images array
  if (!tour.images) {
    tour.images = [];
  }
  tour.images.push(imageUrl);
  
  return this.toursRepository.save(tour);
}

// In a user service
async updateProfilePicture(userId: number, imageUrl: string): Promise<User> {
  const user = await this.findById(userId);
  
  // Update the user's profile picture
  user.profilePicture = imageUrl;
  
  return this.usersRepository.save(user);
}
```

## Error Handling

The upload endpoints will return appropriate error responses in the following cases:

- 400 Bad Request: No file uploaded or invalid file type
- 401 Unauthorized: Missing or invalid authentication token
- 413 Payload Too Large: File size exceeds the maximum allowed size (5MB)
- 500 Internal Server Error: Server-side error during file processing

## Configuration

The upload module is configured in `upload.module.ts`. You can modify the following settings:

- File storage location
- Allowed file types
- Maximum file size
- Maximum number of files for multiple upload