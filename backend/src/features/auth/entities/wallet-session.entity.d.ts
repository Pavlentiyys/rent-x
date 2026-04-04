import { User } from '../../users/entities/user.entity';
export declare class WalletSession {
    id: number;
    userId: number | null;
    walletAddress: string;
    nonce: string;
    message: string;
    expiresAt: Date;
    usedAt: Date | null;
    user: User | null;
    createdAt: Date;
}
