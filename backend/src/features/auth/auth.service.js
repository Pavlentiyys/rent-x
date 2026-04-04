"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const crypto_1 = require("crypto");
const web3_js_1 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
const nacl = __importStar(require("tweetnacl"));
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const wallet_session_entity_1 = require("./entities/wallet-session.entity");
let AuthService = class AuthService {
    jwtService;
    walletSessionsRepository;
    usersRepository;
    constructor(jwtService, walletSessionsRepository, usersRepository) {
        this.jwtService = jwtService;
        this.walletSessionsRepository = walletSessionsRepository;
        this.usersRepository = usersRepository;
    }
    async generateSiwsMessage(wallet) {
        this.assertWalletAddress(wallet);
        const nonce = (0, crypto_1.randomBytes)(16).toString('hex');
        const issuedAt = new Date().toISOString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const user = await this.usersRepository.findOne({
            where: { walletAddress: wallet },
        });
        const message = this.buildSiwsMessage(wallet, nonce, issuedAt);
        const session = this.walletSessionsRepository.create({
            userId: user?.id ?? null,
            walletAddress: wallet,
            nonce,
            message,
            expiresAt,
        });
        await this.walletSessionsRepository.save(session);
        return {
            wallet,
            message,
            expiresAt,
        };
    }
    async verifySignature(wallet, message, signature) {
        const publicKey = this.assertWalletAddress(wallet);
        let signatureBytes;
        try {
            signatureBytes = bs58_1.default.decode(signature);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid signature encoding');
        }
        if (!message.includes(wallet)) {
            throw new common_1.UnauthorizedException('Message must contain wallet address');
        }
        const nonce = this.extractNonce(message);
        const session = await this.walletSessionsRepository.findOne({
            where: {
                walletAddress: wallet,
                nonce,
                message,
                usedAt: (0, typeorm_2.IsNull)(),
                expiresAt: (0, typeorm_2.MoreThan)(new Date()),
            },
        });
        if (!session) {
            throw new common_1.UnauthorizedException('Sign-in session is invalid or expired');
        }
        const messageBytes = new TextEncoder().encode(message);
        const publicKeyBytes = publicKey.toBytes();
        const valid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
        if (!valid) {
            throw new common_1.UnauthorizedException('Signature verification failed');
        }
        let user = await this.usersRepository.findOne({
            where: { walletAddress: wallet },
        });
        if (!user) {
            user = await this.usersRepository.save(this.usersRepository.create({
                walletAddress: wallet,
                isVerified: true,
            }));
        }
        else if (!user.isVerified) {
            user.isVerified = true;
            user = await this.usersRepository.save(user);
        }
        session.userId = user.id;
        session.usedAt = new Date();
        await this.walletSessionsRepository.save(session);
        return {
            access_token: this.jwtService.sign({
                sub: user.id,
                wallet,
            }),
        };
    }
    async getMe(userId) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('Authenticated user not found');
        }
        return user;
    }
    async cleanupExpiredSessions() {
        const result = await this.walletSessionsRepository.delete({
            expiresAt: (0, typeorm_2.LessThan)(new Date()),
        });
        return {
            deleted: result.affected ?? 0,
        };
    }
    assertWalletAddress(wallet) {
        try {
            return new web3_js_1.PublicKey(wallet);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid wallet address');
        }
    }
    extractNonce(message) {
        const nonceMatch = message.match(/^Nonce:\s*(.+)$/m);
        if (!nonceMatch?.[1]) {
            throw new common_1.UnauthorizedException('Message must contain nonce');
        }
        return nonceMatch[1].trim();
    }
    buildSiwsMessage(wallet, nonce, issuedAt) {
        return [
            'RentX wants you to sign in with your Solana account:',
            wallet,
            '',
            'Sign in to RentX - Decentralized Rental Platform',
            '',
            `URI: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`,
            'Version: 1',
            `Nonce: ${nonce}`,
            `Issued At: ${issuedAt}`,
        ].join('\n');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(wallet_session_entity_1.WalletSession)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AuthService);
//# sourceMappingURL=auth.service.js.map