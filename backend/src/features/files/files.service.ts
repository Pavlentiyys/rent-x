import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client as MinioClient } from 'minio';
import { CreateFileUploadDto } from './dto/create-file-upload.dto';

@Injectable()
export class FilesService implements OnModuleInit {
  private readonly client: MinioClient;
  private readonly bucketName: string;
  private readonly publicBaseUrl: string;
  private readonly logger = new Logger(FilesService.name);

  constructor(private readonly configService: ConfigService) {
    const endPoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
    const port = Number(this.configService.get<string>('MINIO_INTERNAL_PORT', '9000'));
    const useSSL = this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true';

    this.client = new MinioClient({
      endPoint,
      port,
      useSSL,
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY', 'minioadmin'),
    });

    this.bucketName = this.configService.get<string>('MINIO_BUCKET', 'rentx');
    this.publicBaseUrl = this.configService.get<string>(
      'MINIO_PUBLIC_URL',
      `${useSSL ? 'https' : 'http'}://${endPoint}:${port}`,
    );
  }

  async onModuleInit() {
    const bucketExists = await this.client.bucketExists(this.bucketName);

    if (!bucketExists) {
      await this.client.makeBucket(this.bucketName);
      this.logger.log(
        JSON.stringify({
          event: 'files.bucket_created',
          bucket: this.bucketName,
        }),
      );
    }
  }

  async createUploadUrl(dto: CreateFileUploadDto, ownerId: number) {
    const objectKey = this.buildObjectKey(dto.fileName, ownerId);
    const uploadUrl = await this.client.presignedPutObject(this.bucketName, objectKey, 15 * 60);

    this.logger.log(
      JSON.stringify({
        event: 'files.upload_url_created',
        ownerId,
        bucket: this.bucketName,
        objectKey,
        contentType: dto.contentType,
        size: dto.size,
      }),
    );

    return {
      bucket: this.bucketName,
      objectKey,
      uploadUrl,
      fileUrl: `${this.publicBaseUrl}/${this.bucketName}/${objectKey}`,
      expiresInSeconds: 15 * 60,
      contentType: dto.contentType,
      size: dto.size,
    };
  }

  private buildObjectKey(fileName: string, ownerId: number) {
    const sanitizedFileName = fileName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    return `posts/${ownerId}/${uniqueSuffix}-${sanitizedFileName || 'file'}`;
  }
}
