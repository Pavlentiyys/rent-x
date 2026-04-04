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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  serializeCurrentUser,
  serializeUserProfile,
} from './serializers/user-response.serializer';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.usersService
      .create(createUserDto, currentUser.wallet)
      .then(serializeCurrentUser);
  }

  @Get('me')
  me(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.usersService.findOne(currentUser.userId).then(serializeCurrentUser);
  }

  @Get()
  findAll() {
    return this.usersService.findAll().then((users) => users.map(serializeUserProfile));
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id).then(serializeUserProfile);
  }

  @Patch('me')
  updateMe(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.usersService
      .update(currentUser.userId, updateUserDto, currentUser.userId)
      .then(serializeCurrentUser);
  }

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

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.usersService.remove(id, currentUser.userId);
  }
}
