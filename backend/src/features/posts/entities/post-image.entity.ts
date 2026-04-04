import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from './post.entity';

@Entity({ name: 'post_images' })
export class PostImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  postId: number;

  @Column({ length: 255 })
  objectKey: string;

  @Column({ length: 2048 })
  url: string;

  @Column({ default: 0 })
  sortOrder: number;

  @ManyToOne(() => Post, (post) => post.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post;
}
