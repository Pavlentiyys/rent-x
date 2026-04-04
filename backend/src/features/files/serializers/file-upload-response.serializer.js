"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadResponseDto = void 0;
exports.serializeFileUploadResponse = serializeFileUploadResponse;
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