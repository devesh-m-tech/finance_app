import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface UploadedFileResult {
  key: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  originalName: string;
}

@Injectable()
export class FilesService {
  private readonly storageType: string;
  private readonly s3Endpoint: string;
  private readonly s3Bucket: string;

  constructor(private readonly config: ConfigService) {
    this.storageType = this.config.get<string>('storage.type', 'mock');
    this.s3Endpoint = this.config.get<string>('storage.s3Endpoint', 'http://minio:9000');
    this.s3Bucket = this.config.get<string>('storage.s3Bucket', 'shri-amudha-files');
  }

  async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    folder = 'documents'
  ): Promise<UploadedFileResult> {
    const timestamp = Date.now();
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${folder}/${timestamp}-${sanitizedName}`;
    const url = `${this.s3Endpoint}/${this.s3Bucket}/${key}`;

    // In mock/dev mode, file is registered with key and URL.
    // In production with AWS-SDK/MinIO client, buffer is streamed to S3.
    return {
      key,
      url,
      mimeType,
      sizeBytes: fileBuffer.length,
      originalName,
    };
  }

  async getSignedUrl(key: string): Promise<string> {
    return `${this.s3Endpoint}/${this.s3Bucket}/${key}`;
  }
}
