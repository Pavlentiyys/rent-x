import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
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
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  CurrentUserResponseDto,
  serializeCurrentUser,
  serializeUserProfile,
  UserProfileResponseDto,
} from './serializers/user-response.serializer';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiOkResponse({ type: CurrentUserResponseDto })
  @ApiCommonErrorResponses(401, 404)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.usersService.findOne(currentUser.userId).then(serializeCurrentUser);
  }

  @ApiOperation({ summary: 'List public user profiles' })
  @ApiOkResponse({ type: UserProfileResponseDto, isArray: true })
  @Get()
  findAll() {
    return this.usersService.findAll().then((users) => users.map(serializeUserProfile));
  }

  @ApiOperation({ summary: 'Get public user profile by id' })
  @ApiOkResponse({ type: UserProfileResponseDto })
  @ApiCommonErrorResponses(404)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id).then(serializeUserProfile);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiOkResponse({ type: CurrentUserResponseDto })
  @ApiCommonErrorResponses(400, 401, 409)
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.usersService
      .update(currentUser.userId, updateUserDto, currentUser.userId)
      .then(serializeCurrentUser);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete current user profile' })
  @ApiOkResponse({
    schema: { properties: { id: { type: 'number' }, deleted: { type: 'boolean' } } },
  })
  @ApiCommonErrorResponses(401, 403, 404)
  @UseGuards(JwtAuthGuard)
  @Delete('me')
  removeMe(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.usersService.remove(currentUser.userId, currentUser.userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile by id (owner only)' })
  @ApiOkResponse({ type: CurrentUserResponseDto })
  @ApiCommonErrorResponses(400, 401, 403, 404, 409)
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.usersService
      .update(id, updateUserDto, currentUser.userId)
      .then((user) =>
        id === currentUser.userId ? serializeCurrentUser(user) : serializeUserProfile(user),
      );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user profile by id (owner only)' })
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
    return this.usersService.remove(id, currentUser.userId);
  }
}
