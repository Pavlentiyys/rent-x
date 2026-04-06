import {
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

@Injectable()
export class AuthRateLimitMiddleware implements NestMiddleware {
  private static readonly requests = new Map<string, RateLimitEntry>();
  private static readonly limit = 5;
  private static readonly ttlMs = 60_000;

  static reset() {
    AuthRateLimitMiddleware.requests.clear();
  }

  use(request: Request, response: Response, next: NextFunction) {
    const tracker = this.resolveTracker(request);
    const key = `${request.method}:${request.originalUrl || request.url}:${tracker}`;
    const now = Date.now();
    const existingEntry = AuthRateLimitMiddleware.requests.get(key);

    if (!existingEntry || existingEntry.resetAt <= now) {
      AuthRateLimitMiddleware.requests.set(key, {
        count: 1,
        resetAt: now + AuthRateLimitMiddleware.ttlMs,
      });
      next();
      return;
    }

    if (existingEntry.count >= AuthRateLimitMiddleware.limit) {
      response.status(429).json({
        statusCode: 429,
        error: 'Too Many Requests',
        message: 'Too many auth attempts, please try again later',
        path: request.originalUrl || request.url,
        requestId: response.getHeader('x-request-id') || null,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    existingEntry.count += 1;
    AuthRateLimitMiddleware.requests.set(key, existingEntry);
    next();
  }

  private resolveTracker(request: Request) {
    const forwardedFor = request.header('x-forwarded-for');

    if (forwardedFor?.trim()) {
      return forwardedFor.split(',')[0]?.trim() ?? forwardedFor.trim();
    }

    return request.ip ?? 'unknown-ip';
  }
}
