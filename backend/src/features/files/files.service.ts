import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { CreateFileUploadDto } from './dto/create-file-upload.dto';

@Injectable()
export class FilesService implements OnModuleInit {
  private readonly client: S3Client;
  private readonly bucketName: string;
  private readonly publicBaseUrl: string;
  private readonly logger = new Logger(FilesService.name);

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('S3_ENDPOINT');
    const region = this.configService.get<string>('S3_REGION', 'ap-southeast-1');

    this.client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId: this.configService.get<string>('S3_ACCESS_KEY', ''),
        secretAccessKey: this.configService.get<string>('S3_SECRET_KEY', ''),
      },
      forcePathStyle: true,
    });

    this.bucketName = this.configService.get<string>('S3_BUCKET', 'rentx');
    this.publicBaseUrl = this.configService.get<string>('S3_PUBLIC_URL', '');
  }

  onModuleInit() {
    this.initBucket().catch(() => {});
  }

  private async initBucket() {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      this.logger.log(JSON.stringify({ event: 'files.bucket_exists', bucket: this.bucketName }));
    } catch (err: any) {
      if (err?.name === 'NotFound' || err?.$metadata?.httpStatusCode === 404) {
        try {
          await this.client.send(new CreateBucketCommand({ Bucket: this.bucketName }));
          this.logger.log(JSON.stringify({ event: 'files.bucket_created', bucket: this.bucketName }));
        } catch (createErr) {
          this.logger.warn(JSON.stringify({ event: 'files.bucket_create_failed', error: String(createErr) }));
        }
      } else {
        this.logger.warn(JSON.stringify({ event: 'files.bucket_check_failed', error: String(err) }));
      }
    }
  }

  async createUploadUrl(dto: CreateFileUploadDto, ownerId: number) {
    const objectKey = this.buildObjectKey(dto.fileName, ownerId);

    this.logger.log(JSON.stringify({
      event: 'files.presign_start',
      bucket: this.bucketName,
      objectKey,
    }));

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: objectKey,
      ContentType: dto.contentType,
    });

    let uploadUrl: string;
    try {
      uploadUrl = await getSignedUrl(this.client, command, { expiresIn: 15 * 60 });
    } catch (err) {
      this.logger.error(JSON.stringify({ event: 'files.presign_failed', error: String(err) }));
      throw err;
    }

    this.logger.log(JSON.stringify({
      event: 'files.upload_url_created',
      ownerId,
      bucket: this.bucketName,
      objectKey,
    }));

    return {
      bucket: this.bucketName,
      objectKey,
      uploadUrl,
      fileUrl: `${this.publicBaseUrl}/${objectKey}`,
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
