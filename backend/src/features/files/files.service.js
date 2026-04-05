"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var FilesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const minio_1 = require("minio");
let FilesService = FilesService_1 = class FilesService {
    configService;
    client;
    bucketName;
    publicBaseUrl;
    logger = new common_1.Logger(FilesService_1.name);
    constructor(configService) {
        this.configService = configService;
        const endPoint = this.configService.get('MINIO_ENDPOINT', 'localhost');
        const port = Number(this.configService.get('MINIO_INTERNAL_PORT', '9000'));
        const useSSL = this.configService.get('MINIO_USE_SSL', 'false') === 'true';
        this.client = new minio_1.Client({
            endPoint,
            port,
            useSSL,
            accessKey: this.configService.get('MINIO_ACCESS_KEY', 'minioadmin'),
            secretKey: this.configService.get('MINIO_SECRET_KEY', 'minioadmin'),
        });
        this.bucketName = this.configService.get('MINIO_BUCKET', 'rentx');
        this.publicBaseUrl = this.configService.get('MINIO_PUBLIC_URL', `${useSSL ? 'https' : 'http'}://${endPoint}:${port}`);
    }
    async onModuleInit() {
        const bucketExists = await this.client.bucketExists(this.bucketName);
        if (!bucketExists) {
            await this.client.makeBucket(this.bucketName);
            this.logger.log(JSON.stringify({
                event: 'files.bucket_created',
                bucket: this.bucketName,
            }));
        }
    }
    async createUploadUrl(dto, ownerId) {
        const objectKey = this.buildObjectKey(dto.fileName, ownerId);
        const uploadUrl = await this.client.presignedPutObject(this.bucketName, objectKey, 15 * 60);
        this.logger.log(JSON.stringify({
            event: 'files.upload_url_created',
            ownerId,
            bucket: this.bucketName,
            objectKey,
            contentType: dto.contentType,
            size: dto.size,
        }));
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
    buildObjectKey(fileName, ownerId) {
        const sanitizedFileName = fileName
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9._-]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        return `posts/${ownerId}/${uniqueSuffix}-${sanitizedFileName || 'file'}`;
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = FilesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FilesService);
//# sourceMappingURL=files.service.js.map