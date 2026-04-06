import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto, actorWallet: string) {
    if (createUserDto.walletAddress !== actorWallet) {
      throw new ForbiddenException('Wallet address must match authenticated user');
    }

    const existingUser = await this.usersRepository.findOne({
      where: [{ walletAddress: createUserDto.walletAddress }, ...(createUserDto.username ? [{ username: createUserDto.username }] : [])],
    });

    if (existingUser) {
      throw new ConflictException('User with provided wallet or username already exists');
    }

    const user = this.usersRepository.create(createUserDto);
    const savedUser = await this.usersRepository.save(user);

    this.logger.log(
      JSON.stringify({
        event: 'user.created',
        userId: savedUser.id,
        walletAddress: savedUser.walletAddress,
        username: savedUser.username,
      }),
    );

    return savedUser;
  }

  findAll() {
    return this.usersRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto, actorUserId: number) {
    if (id !== actorUserId) {
      throw new ForbiddenException('You can only update your own profile');
    }

    const user = await this.findOne(id);

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.usersRepository.findOne({
        where: { username: updateUserDto.username },
      });

      if (existingUser) {
        throw new ConflictException('Username is already taken');
      }
    }

    this.usersRepository.merge(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);

    this.logger.log(
      JSON.stringify({
        event: 'user.updated',
        userId: updatedUser.id,
        actorUserId,
        username: updatedUser.username,
      }),
    );

    return updatedUser;
  }

  async remove(id: number, actorUserId: number) {
    if (id !== actorUserId) {
      throw new ForbiddenException('You can only remove your own profile');
    }

    const user = await this.findOne(id);
    await this.usersRepository.remove(user);

    this.logger.log(
      JSON.stringify({
        event: 'user.deleted',
        userId: user.id,
        actorUserId,
      }),
    );

    return {
      id,
      deleted: true,
    };
  }
}
