import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from '../../posts/entities/post.entity';
import { Rent } from '../../rents/entities/rent.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'reviews' })
@Check(`"rating" >= 1 AND "rating" <= 5`)
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  rentId: number;

  @Column()
  authorId: number;

  @Column()
  targetUserId: number;

  @Column()
  postId: number;

  @Column({ type: 'smallint' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @ManyToOne(() => Rent, (rent) => rent.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rentId' })
  rent: Rent;

  @ManyToOne(() => User, (user) => user.writtenReviews, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @ManyToOne(() => User, (user) => user.receivedReviews, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'targetUserId' })
  targetUser: User;

  @ManyToOne(() => Post, (post) => post.reviews, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @CreateDateColumn()
  createdAt: Date;
}
