import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
export declare class AuthRateLimitMiddleware implements NestMiddleware {
    private static readonly requests;
    private static readonly limit;
    private static readonly ttlMs;
    static reset(): void;
    use(request: Request, response: Response, next: NextFunction): void;
    private resolveTracker;
}
