export declare class FileUploadResponseDto {
    bucket: string;
    objectKey: string;
    uploadUrl: string;
    fileUrl: string;
    expiresInSeconds: number;
    contentType: string;
    size: number;
}
export declare function serializeFileUploadResponse(response: FileUploadResponseDto): FileUploadResponseDto;
