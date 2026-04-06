"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AuthRateLimitMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRateLimitMiddleware = void 0;
const common_1 = require("@nestjs/common");
let AuthRateLimitMiddleware = class AuthRateLimitMiddleware {
    static { AuthRateLimitMiddleware_1 = this; }
    static requests = new Map();
    static limit = 5;
    static ttlMs = 60_000;
    static reset() {
        AuthRateLimitMiddleware_1.requests.clear();
    }
    use(request, response, next) {
        const tracker = this.resolveTracker(request);
        const key = `${request.method}:${request.originalUrl || request.url}:${tracker}`;
        const now = Date.now();
        const existingEntry = AuthRateLimitMiddleware_1.requests.get(key);
        if (!existingEntry || existingEntry.resetAt <= now) {
            AuthRateLimitMiddleware_1.requests.set(key, {
                count: 1,
                resetAt: now + AuthRateLimitMiddleware_1.ttlMs,
            });
            next();
            return;
        }
        if (existingEntry.count >= AuthRateLimitMiddleware_1.limit) {
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
        AuthRateLimitMiddleware_1.requests.set(key, existingEntry);
        next();
    }
    resolveTracker(request) {
        const forwardedFor = request.header('x-forwarded-for');
        if (forwardedFor?.trim()) {
            return forwardedFor.split(',')[0]?.trim() ?? forwardedFor.trim();
        }
        return request.ip ?? 'unknown-ip';
    }
};
exports.AuthRateLimitMiddleware = AuthRateLimitMiddleware;
exports.AuthRateLimitMiddleware = AuthRateLimitMiddleware = AuthRateLimitMiddleware_1 = __decorate([
    (0, common_1.Injectable)()
], AuthRateLimitMiddleware);
//# sourceMappingURL=auth-rate-limit.middleware.js.map