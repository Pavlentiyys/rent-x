import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from './post.entity';

export enum PostAttributeType {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Json = 'json',
}

@Entity({ name: 'post_attributes' })
export class PostAttribute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  postId: number;

  @Column({ length: 100 })
  key: string;

  @Column({ type: 'text' })
  value: string;

  @Column({
    type: 'enum',
    enum: PostAttributeType,
    default: PostAttributeType.String,
  })
  type: PostAttributeType;

  @ManyToOne(() => Post, (post) => post.attributes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post;
}
