"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestContextMiddleware = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let RequestContextMiddleware = class RequestContextMiddleware {
    logger = new common_1.Logger('Http');
    use(request, response, next) {
        const startedAt = Date.now();
        const requestId = this.resolveRequestId(request);
        request.requestId = requestId;
        response.setHeader('x-request-id', requestId);
        response.on('finish', () => {
            const durationMs = Date.now() - startedAt;
            this.logger.log(JSON.stringify({
                requestId,
                method: request.method,
                path: request.originalUrl || request.url,
                statusCode: response.statusCode,
                durationMs,
                userId: request.user?.userId ?? null,
                wallet: request.user?.wallet ?? null,
                ip: request.ip,
            }));
        });
        next();
    }
    resolveRequestId(request) {
        const headerValue = request.header('x-request-id');
        if (headerValue?.trim()) {
            return headerValue.trim();
        }
        return (0, crypto_1.randomUUID)();
    }
};
exports.RequestContextMiddleware = RequestContextMiddleware;
exports.RequestContextMiddleware = RequestContextMiddleware = __decorate([
    (0, common_1.Injectable)()
], RequestContextMiddleware);
//# sourceMappingURL=request-context.middleware.js.map