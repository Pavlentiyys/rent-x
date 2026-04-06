import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

type RequestWithContext = Request & {
  requestId?: string;
  user?: {
    userId?: number;
    wallet?: string;
  };
};

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger('Http');

  use(request: RequestWithContext, response: Response, next: NextFunction) {
    const startedAt = Date.now();
    const requestId = this.resolveRequestId(request);

    request.requestId = requestId;
    response.setHeader('x-request-id', requestId);

    response.on('finish', () => {
      const durationMs = Date.now() - startedAt;

      this.logger.log(
        JSON.stringify({
          requestId,
          method: request.method,
          path: request.originalUrl || request.url,
          statusCode: response.statusCode,
          durationMs,
          userId: request.user?.userId ?? null,
          wallet: request.user?.wallet ?? null,
          ip: request.ip,
        }),
      );
    });

    next();
  }

  private resolveRequestId(request: Request) {
    const headerValue = request.header('x-request-id');

    if (headerValue?.trim()) {
      return headerValue.trim();
    }

    return randomUUID();
  }
}
