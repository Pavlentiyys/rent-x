"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let HttpExceptionFilter = class HttpExceptionFilter {
    catch(exception, host) {
        const context = host.switchToHttp();
        const response = context.getResponse();
        const request = context.getRequest();
        if (exception instanceof common_1.HttpException) {
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
        response.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Internal Server Error',
            message: 'Internal server error',
            path: request.url,
            timestamp: new Date().toISOString(),
        });
    }
    normalizeHttpExceptionResponse(statusCode, exceptionResponse) {
        if (typeof exceptionResponse === 'string') {
            return {
                statusCode,
                error: this.defaultErrorLabel(statusCode),
                message: exceptionResponse,
            };
        }
        const responseObject = exceptionResponse;
        return {
            statusCode,
            error: responseObject.error ?? this.defaultErrorLabel(statusCode),
            message: responseObject.message ?? this.defaultErrorLabel(statusCode),
        };
    }
    defaultErrorLabel(statusCode) {
        switch (statusCode) {
            case common_1.HttpStatus.BAD_REQUEST:
                return 'Bad Request';
            case common_1.HttpStatus.UNAUTHORIZED:
                return 'Unauthorized';
            case common_1.HttpStatus.FORBIDDEN:
                return 'Forbidden';
            case common_1.HttpStatus.NOT_FOUND:
                return 'Not Found';
            case common_1.HttpStatus.CONFLICT:
                return 'Conflict';
            default:
                return 'Error';
        }
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map