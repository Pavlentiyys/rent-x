import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

type RequestWithContext = Request & {
  requestId?: string;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<RequestWithContext>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const errorPayload = this.normalizeHttpExceptionResponse(status, exceptionResponse);

      if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(
          JSON.stringify({
            requestId: request.requestId ?? null,
            method: request.method,
            path: request.url,
            statusCode: status,
            message: errorPayload.message,
          }),
        );
      }

      response.status(status).json({
        ...errorPayload,
        requestId: request.requestId ?? null,
        path: request.url,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'Internal server error',
      requestId: request.requestId ?? null,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private normalizeHttpExceptionResponse(
    statusCode: number,
    exceptionResponse: string | object,
  ) {
    if (typeof exceptionResponse === 'string') {
      return {
        statusCode,
        error: this.defaultErrorLabel(statusCode),
        message: exceptionResponse,
      };
    }

    const responseObject = exceptionResponse as {
      message?: string | string[];
      error?: string;
      statusCode?: number;
    };

    return {
      statusCode,
      error: responseObject.error ?? this.defaultErrorLabel(statusCode),
      message: responseObject.message ?? this.defaultErrorLabel(statusCode),
    };
  }

  private defaultErrorLabel(statusCode: number) {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'Too Many Requests';
      default:
        return 'Error';
    }
  }
}
