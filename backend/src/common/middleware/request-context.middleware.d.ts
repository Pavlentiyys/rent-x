import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
type RequestWithContext = Request & {
    requestId?: string;
    user?: {
        userId?: number;
        wallet?: string;
    };
};
export declare class RequestContextMiddleware implements NestMiddleware {
    private readonly logger;
    use(request: RequestWithContext, response: Response, next: NextFunction): void;
    private resolveRequestId;
}
export {};
