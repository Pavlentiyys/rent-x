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
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../common/swagger/api-common-error-responses.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PostActionDto } from './dto/post-action.dto';
import { SearchPostsDto } from './dto/search-posts.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';
import {
  PaginatedPostsResponseDto,
  PostResponseDto,
  serializePaginatedPosts,
  serializePost,
} from './serializers/post-response.serializer';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a rental post' })
  @ApiOkResponse({ type: PostResponseDto })
  @ApiCommonErrorResponses(400, 401, 403, 404, 409)
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() dto: CreatePostDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.postsService.create(dto, currentUser.userId).then(serializePost);
  }

  @ApiOperation({ summary: 'Search active rental posts' })
  @ApiOkResponse({ type: PaginatedPostsResponseDto })
  @Get()
  findAll(@Query() query: SearchPostsDto) {
    return this.postsService.findAll(query).then(serializePaginatedPosts);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'List current user posts' })
  @ApiOkResponse({ type: PaginatedPostsResponseDto })
  @UseGuards(JwtAuthGuard)
  @Get('mine')
  findMine(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: SearchPostsDto,
  ) {
    return this.postsService
      .findMine(currentUser.userId, query)
      .then(serializePaginatedPosts);
  }

  @ApiOperation({ summary: 'Get post by id' })
  @ApiOkResponse({ type: PostResponseDto })
  @ApiCommonErrorResponses(404)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id).then(serializePost);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own post' })
  @ApiOkResponse({ type: PostResponseDto })
  @ApiCommonErrorResponses(400, 401, 403, 404, 409)
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.postsService.update(id, dto, currentUser.userId).then(serializePost);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish a draft or paused post' })
  @ApiOkResponse({ type: PostResponseDto })
  @ApiCommonErrorResponses(401, 403, 404, 409)
  @UseGuards(JwtAuthGuard)
  @Post(':id/publish')
  publish(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.postsService.publish(id, currentUser.userId).then(serializePost);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pause a post' })
  @ApiOkResponse({ type: PostResponseDto })
  @ApiCommonErrorResponses(400, 401, 403, 404, 409)
  @UseGuards(JwtAuthGuard)
  @Post(':id/pause')
  pause(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PostActionDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.postsService.pause(id, currentUser.userId, dto.reason).then(serializePost);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Archive a post' })
  @ApiOkResponse({ type: PostResponseDto })
  @ApiCommonErrorResponses(400, 401, 403, 404, 409)
  @UseGuards(JwtAuthGuard)
  @Post(':id/archive')
  archive(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PostActionDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.postsService
      .archive(id, currentUser.userId, dto.reason)
      .then(serializePost);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a post' })
  @ApiOkResponse({
    schema: { properties: { id: { type: 'number' }, deleted: { type: 'boolean' } } },
  })
  @ApiCommonErrorResponses(401, 403, 404, 409)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.postsService.remove(id, currentUser.userId);
  }
}
