export declare class ApiErrorResponseDto {
    statusCode: number;
    error: string;
    message: string | string[];
    path: string;
    requestId: string | null;
    timestamp: string;
}
