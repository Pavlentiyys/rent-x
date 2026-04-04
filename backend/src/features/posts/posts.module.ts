import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rent } from '../rents/entities/rent.entity';
import { User } from '../users/entities/user.entity';
import { PostAttribute } from './entities/post-attribute.entity';
import { PostImage } from './entities/post-image.entity';
import { Post } from './entities/post.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, PostAttribute, PostImage, Rent, User]),
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
