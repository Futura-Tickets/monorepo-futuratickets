import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';

@Injectable()
export class StorageService {
  private storage: Storage;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const projectId = this.configService.get<string>('GCS_PROJECT_ID');
    const keyFilename = this.configService.get<string>('GCS_KEY_FILE');
    const bucketName = this.configService.get<string>('GCS_BUCKET_NAME');

    if (!projectId || !keyFilename || !bucketName) {
      throw new Error(
        'Missing required Google Cloud Storage configuration. Please set GCS_PROJECT_ID, GCS_KEY_FILE, and GCS_BUCKET_NAME environment variables.',
      );
    }

    // Initialize Google Cloud Storage
    this.storage = new Storage({
      projectId,
      keyFilename,
    });

    this.bucketName = bucketName;
  }

  /**
   * Upload a file to Google Cloud Storage
   * @param file - File buffer or stream
   * @param filename - Destination filename
   * @param contentType - MIME type
   * @returns Public URL of the uploaded file
   */
  async uploadFile(
    file: Buffer | NodeJS.ReadableStream,
    filename: string,
    contentType: string,
  ): Promise<string> {
    const bucket = this.storage.bucket(this.bucketName);
    const blob = bucket.file(filename);

    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType,
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    });

    return new Promise((resolve, reject) => {
      blobStream.on('error', (err) => {
        reject(err);
      });

      blobStream.on('finish', async () => {
        // Make the file public
        await blob.makePublic();

        // Return public URL
        const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${filename}`;
        resolve(publicUrl);
      });

      if (Buffer.isBuffer(file)) {
        blobStream.end(file);
      } else {
        (file as NodeJS.ReadableStream).pipe(blobStream);
      }
    });
  }

  /**
   * Delete a file from Google Cloud Storage
   * @param filename - Filename to delete
   */
  async deleteFile(filename: string): Promise<void> {
    const bucket = this.storage.bucket(this.bucketName);
    await bucket.file(filename).delete();
  }

  /**
   * Get signed URL for temporary private access
   * @param filename - Filename
   * @param expiresIn - Expiration time in seconds (default 15 min)
   * @returns Signed URL
   */
  async getSignedUrl(
    filename: string,
    expiresIn: number = 900,
  ): Promise<string> {
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(filename);

    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresIn * 1000,
    });

    return url;
  }

  /**
   * Check if file exists
   * @param filename - Filename to check
   * @returns Boolean indicating if file exists
   */
  async fileExists(filename: string): Promise<boolean> {
    const bucket = this.storage.bucket(this.bucketName);
    const [exists] = await bucket.file(filename).exists();
    return exists;
  }
}
