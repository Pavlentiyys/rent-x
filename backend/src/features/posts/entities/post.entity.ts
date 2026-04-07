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
import { Rent } from '../../rents/entities/rent.entity';
import { Review } from '../../reviews/entities/review.entity';
import { User } from '../../users/entities/user.entity';
import { PostAttribute } from './post-attribute.entity';
import { PostImage } from './post-image.entity';

export enum PostStatus {
  Draft = 'draft',
  Active = 'active',
  Paused = 'paused',
  Rented = 'rented',
  Archived = 'archived',
}

@Entity({ name: 'posts' })
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ownerId: number;

  @Column({ length: 160 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 80 })
  category: string;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  pricePerDay: string;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  depositAmount: string;

  @Column({ length: 64 })
  currencyMint: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  contactInfo: string | null;

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.Draft,
  })
  status: PostStatus;

  @Column({ type: 'timestamp with time zone', nullable: true })
  availableFrom: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  availableTo: Date | null;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @OneToMany(() => PostAttribute, (postAttribute) => postAttribute.post)
  attributes: PostAttribute[];

  @OneToMany(() => PostImage, (postImage) => postImage.post)
  images: PostImage[];

  @OneToMany(() => Rent, (rent) => rent.post)
  rents: Rent[];

  @OneToMany(() => Review, (review) => review.post)
  reviews: Review[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
