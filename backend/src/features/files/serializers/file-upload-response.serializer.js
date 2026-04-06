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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadResponseDto = void 0;
exports.serializeFileUploadResponse = serializeFileUploadResponse;
const swagger_1 = require("@nestjs/swagger");
class FileUploadResponseDto {
    bucket;
    objectKey;
    uploadUrl;
    fileUrl;
    expiresInSeconds;
    contentType;
    size;
}
exports.FileUploadResponseDto = FileUploadResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], FileUploadResponseDto.prototype, "bucket", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], FileUploadResponseDto.prototype, "objectKey", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], FileUploadResponseDto.prototype, "uploadUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], FileUploadResponseDto.prototype, "fileUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], FileUploadResponseDto.prototype, "expiresInSeconds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], FileUploadResponseDto.prototype, "contentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], FileUploadResponseDto.prototype, "size", void 0);
function serializeFileUploadResponse(response) {
    return {
        bucket: response.bucket,
        objectKey: response.objectKey,
        uploadUrl: response.uploadUrl,
        fileUrl: response.fileUrl,
        expiresInSeconds: response.expiresInSeconds,
        contentType: response.contentType,
        size: response.size,
    };
}
//# sourceMappingURL=file-upload-response.serializer.js.map