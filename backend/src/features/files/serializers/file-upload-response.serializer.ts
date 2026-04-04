export class FileUploadResponseDto {
  bucket: string;
  objectKey: string;
  uploadUrl: string;
  fileUrl: string;
  expiresInSeconds: number;
  contentType: string;
  size: number;
}

export function serializeFileUploadResponse(
  response: FileUploadResponseDto,
): FileUploadResponseDto {
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
