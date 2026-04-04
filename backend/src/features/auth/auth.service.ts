import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import * as nacl from 'tweetnacl';
import { IsNull, LessThan, MoreThan, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { WalletSession } from './entities/wallet-session.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(WalletSession)
    private readonly walletSessionsRepository: Repository<WalletSession>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async generateSiwsMessage(wallet: string) {
    this.assertWalletAddress(wallet);

    const nonce = randomBytes(16).toString('hex');
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

  /**
   * Verifies a Sign-In with Solana signature.
   * The frontend signs a message with the wallet and sends:
   *   { wallet, message, signature }
   *
   * signature is base58-encoded bytes from wallet.signMessage().
   */
  async verifySignature(
    wallet: string,
    message: string,
    signature: string,
  ): Promise<{ access_token: string }> {
    const publicKey = this.assertWalletAddress(wallet);

    let signatureBytes: Uint8Array;
    try {
      signatureBytes = bs58.decode(signature);
    } catch {
      throw new UnauthorizedException('Invalid signature encoding');
    }

    if (!message.includes(wallet)) {
      throw new UnauthorizedException('Message must contain wallet address');
    }

    const nonce = this.extractNonce(message);
    const session = await this.walletSessionsRepository.findOne({
      where: {
        walletAddress: wallet,
        nonce,
        message,
        usedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!session) {
      throw new UnauthorizedException('Sign-in session is invalid or expired');
    }

    const messageBytes = new TextEncoder().encode(message);
    const publicKeyBytes = publicKey.toBytes();
    const valid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes,
    );

    if (!valid) {
      throw new UnauthorizedException('Signature verification failed');
    }

    let user = await this.usersRepository.findOne({
      where: { walletAddress: wallet },
    });

    if (!user) {
      user = await this.usersRepository.save(
        this.usersRepository.create({
          walletAddress: wallet,
          isVerified: true,
        }),
      );
    } else if (!user.isVerified) {
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
      } satisfies JwtPayload),
    };
  }

  async getMe(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Authenticated user not found');
    }

    return user;
  }

  async cleanupExpiredSessions() {
    const result = await this.walletSessionsRepository.delete({
      expiresAt: LessThan(new Date()),
    });

    return {
      deleted: result.affected ?? 0,
    };
  }

  private assertWalletAddress(wallet: string): PublicKey {
    try {
      return new PublicKey(wallet);
    } catch {
      throw new UnauthorizedException('Invalid wallet address');
    }
  }

  private extractNonce(message: string): string {
    const nonceMatch = message.match(/^Nonce:\s*(.+)$/m);

    if (!nonceMatch?.[1]) {
      throw new UnauthorizedException('Message must contain nonce');
    }

    return nonceMatch[1].trim();
  }

  private buildSiwsMessage(
    wallet: string,
    nonce: string,
    issuedAt: string,
  ): string {
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
}
