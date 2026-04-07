import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from '../../posts/entities/post.entity';
import { User } from '../../users/entities/user.entity';
import { Review } from '../../reviews/entities/review.entity';
import { RentEvent } from './rent-event.entity';

export enum RentStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
  Paid = 'paid',
  Active = 'active',
  ReturnRequested = 'return_requested',
  Completed = 'completed',
  Cancelled = 'cancelled',
  Disputed = 'disputed',
}

@Entity({ name: 'rents' })
export class Rent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  postId: number;

  @Column()
  ownerId: number;

  @Column()
  renterId: number;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({ type: 'integer' })
  daysCount: number;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  pricePerDay: string;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  rentAmount: string;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  depositAmount: string;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  platformFeeAmount: string;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  totalAmount: string;

  @Column({ length: 64 })
  currencyMint: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  paymentTxSignature: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  depositTxSignature: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  returnTxSignature: string | null;

  @Column({
    type: 'enum',
    enum: RentStatus,
    default: RentStatus.Pending,
  })
  status: RentStatus;

  @Column({ type: 'text', nullable: true })
  cancelReason: string | null;

  @ManyToOne(() => Post, (post) => post.rents, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @ManyToOne(() => User, (user) => user.ownerRents, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @ManyToOne(() => User, (user) => user.renterRents, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'renterId' })
  renter: User;

  @OneToMany(() => Review, (review) => review.rent)
  reviews: Review[];

  @OneToMany(() => RentEvent, (rentEvent) => rentEvent.rent)
  events: RentEvent[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
