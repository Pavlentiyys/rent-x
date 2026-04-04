import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const errorPayload = this.normalizeHttpExceptionResponse(status, exceptionResponse);

      response.status(status).json({
        ...errorPayload,
        path: request.url,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'Internal server error',
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
      default:
        return 'Error';
    }
  }
}
