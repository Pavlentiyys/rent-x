import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateFileUploadDto } from './dto/create-file-upload.dto';
export declare class FilesService implements OnModuleInit {
    private readonly configService;
    private readonly client;
    private readonly bucketName;
    private readonly publicBaseUrl;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    createUploadUrl(dto: CreateFileUploadDto, ownerId: number): Promise<{
        bucket: string;
        objectKey: string;
        uploadUrl: string;
        fileUrl: string;
        expiresInSeconds: number;
        contentType: string;
        size: number;
    }>;
    private buildObjectKey;
}
