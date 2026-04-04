import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { WalletSession } from './entities/wallet-session.entity';
export declare class AuthService {
    private readonly jwtService;
    private readonly walletSessionsRepository;
    private readonly usersRepository;
    constructor(jwtService: JwtService, walletSessionsRepository: Repository<WalletSession>, usersRepository: Repository<User>);
    generateSiwsMessage(wallet: string): Promise<{
        wallet: string;
        message: string;
        expiresAt: Date;
    }>;
    verifySignature(wallet: string, message: string, signature: string): Promise<{
        access_token: string;
    }>;
    getMe(userId: number): Promise<User>;
    cleanupExpiredSessions(): Promise<{
        deleted: number;
    }>;
    private assertWalletAddress;
    private extractNonce;
    private buildSiwsMessage;
}
