import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';
import { RentEvent } from './entities/rent-event.entity';
import { Rent } from './entities/rent.entity';
import { RentsController } from './rents.controller';
import { RentsService } from './rents.service';

@Module({
  imports: [TypeOrmModule.forFeature([Rent, RentEvent, Post, User])],
  controllers: [RentsController],
  providers: [RentsService],
  exports: [RentsService],
})
export class RentsModule {}
