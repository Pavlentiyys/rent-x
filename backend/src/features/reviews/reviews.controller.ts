import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
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
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsService } from './reviews.service';
import {
  ReviewResponseDto,
  serializeReview,
  serializeReviewList,
} from './serializers/review-response.serializer';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create review for completed rent' })
  @ApiOkResponse({ type: ReviewResponseDto })
  @ApiCommonErrorResponses(400, 401, 403, 404, 409)
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateReviewDto, @CurrentUser() currentUser: AuthenticatedUser) {
    return this.reviewsService.create(dto, currentUser.userId).then(serializeReview);
  }

  @ApiOperation({ summary: 'List public reviews' })
  @ApiOkResponse({ type: ReviewResponseDto, isArray: true })
  @Get()
  findAll() {
    return this.reviewsService.findAll().then(serializeReviewList);
  }

  @ApiOperation({ summary: 'Get review by id' })
  @ApiOkResponse({ type: ReviewResponseDto })
  @ApiCommonErrorResponses(404)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.findOne(id).then(serializeReview);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own review' })
  @ApiOkResponse({ type: ReviewResponseDto })
  @ApiCommonErrorResponses(400, 401, 403, 404)
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReviewDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.reviewsService.update(id, dto, currentUser.userId).then(serializeReview);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete own review' })
  @ApiOkResponse({
    schema: { properties: { id: { type: 'number' }, deleted: { type: 'boolean' } } },
  })
  @ApiCommonErrorResponses(401, 403, 404)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.reviewsService.remove(id, currentUser.userId);
  }
}
