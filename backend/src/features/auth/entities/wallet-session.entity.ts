import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'wallet_sessions' })
export class WalletSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: true })
  userId: number | null;

  @Column({ length: 64 })
  walletAddress: string;

  @Column({ unique: true, length: 128 })
  nonce: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'timestamp with time zone' })
  expiresAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  usedAt: Date | null;

  @ManyToOne(() => User, (user) => user.walletSessions, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'userId' })
  user: User | null;

  @CreateDateColumn()
  createdAt: Date;
}
