import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PostActionDto } from './dto/post-action.dto';
import { SearchPostsDto } from './dto/search-posts.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() dto: CreatePostDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.postsService.create(dto, currentUser.userId);
  }

  @Get()
  findAll(@Query() query: SearchPostsDto) {
    return this.postsService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  findMine(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: SearchPostsDto,
  ) {
    return this.postsService.findMine(currentUser.userId, query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.postsService.update(id, dto, currentUser.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/publish')
  publish(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.postsService.publish(id, currentUser.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/pause')
  pause(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PostActionDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.postsService.pause(id, currentUser.userId, dto.reason);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/archive')
  archive(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PostActionDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.postsService.archive(id, currentUser.userId, dto.reason);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.postsService.remove(id, currentUser.userId);
  }
}
