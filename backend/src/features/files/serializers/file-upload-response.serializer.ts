import { ApiProperty } from '@nestjs/swagger';

export class FileUploadResponseDto {
  @ApiProperty()
  bucket: string;
  @ApiProperty()
  objectKey: string;
  @ApiProperty()
  uploadUrl: string;
  @ApiProperty()
  fileUrl: string;
  @ApiProperty()
  expiresInSeconds: number;
  @ApiProperty()
  contentType: string;
  @ApiProperty()
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
