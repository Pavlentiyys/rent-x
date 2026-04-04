import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from '../../posts/entities/post.entity';
import { Rent } from '../../rents/entities/rent.entity';
import { Review } from '../../reviews/entities/review.entity';
import { WalletSession } from '../../auth/entities/wallet-session.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  walletAddress: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  username: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  displayName: string | null;

  @Column({ type: 'varchar', nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: string;

  @Column({ default: 0 })
  reviewsCount: number;

  @Column({ default: false })
  isVerified: boolean;

  @OneToMany(() => Post, (post) => post.owner)
  posts: Post[];

  @OneToMany(() => Rent, (rent) => rent.owner)
  ownerRents: Rent[];

  @OneToMany(() => Rent, (rent) => rent.renter)
  renterRents: Rent[];

  @OneToMany(() => Review, (review) => review.author)
  writtenReviews: Review[];

  @OneToMany(() => Review, (review) => review.targetUser)
  receivedReviews: Review[];

  @OneToMany(() => WalletSession, (walletSession) => walletSession.user)
  walletSessions: WalletSession[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
