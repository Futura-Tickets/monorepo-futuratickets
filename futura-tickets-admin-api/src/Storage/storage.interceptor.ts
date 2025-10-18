import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';

@Injectable()
export class StorageFileInterceptor implements NestInterceptor {
  constructor(private readonly storageService: StorageService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const file = request.file;

    if (!file) {
      throw new BadRequestException('File is required');
    }

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const fileExtension = file.originalname.split('.').pop();
      const filename = `${timestamp}-${randomString}.${fileExtension}`;

      // Upload to Google Cloud Storage
      const publicUrl = await this.storageService.uploadFile(file.buffer, filename, file.mimetype);

      // Attach the public URL to the request object
      request.fileUrl = publicUrl;
      request.fileName = filename;

      // Type assertion to handle RxJS version mismatch in monorepo
      return next.handle() as Observable<any>;
    } catch (error) {
      throw new BadRequestException(`File upload failed: ${error.message}`);
    }
  }
}

/**
 * Factory function to create the interceptor with field name
 * This mimics the Azure Storage interceptor API
 * @param _fieldName - Field name (unused, kept for API compatibility)
 */
export function StorageFileInterceptorFactory(_fieldName: string = 'file') {
  return StorageFileInterceptor;
}
