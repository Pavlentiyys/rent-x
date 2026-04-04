"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
let UsersService = class UsersService {
    usersRepository;
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async create(createUserDto, actorWallet) {
        if (createUserDto.walletAddress !== actorWallet) {
            throw new common_1.ForbiddenException('Wallet address must match authenticated user');
        }
        const existingUser = await this.usersRepository.findOne({
            where: [{ walletAddress: createUserDto.walletAddress }, ...(createUserDto.username ? [{ username: createUserDto.username }] : [])],
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with provided wallet or username already exists');
        }
        const user = this.usersRepository.create(createUserDto);
        return this.usersRepository.save(user);
    }
    findAll() {
        return this.usersRepository.find({
            order: {
                createdAt: 'DESC',
            },
        });
    }
    async findOne(id) {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`User ${id} not found`);
        }
        return user;
    }
    async update(id, updateUserDto, actorUserId) {
        if (id !== actorUserId) {
            throw new common_1.ForbiddenException('You can only update your own profile');
        }
        const user = await this.findOne(id);
        if (updateUserDto.username && updateUserDto.username !== user.username) {
            const existingUser = await this.usersRepository.findOne({
                where: { username: updateUserDto.username },
            });
            if (existingUser) {
                throw new common_1.ConflictException('Username is already taken');
            }
        }
        this.usersRepository.merge(user, updateUserDto);
        return this.usersRepository.save(user);
    }
    async remove(id, actorUserId) {
        if (id !== actorUserId) {
            throw new common_1.ForbiddenException('You can only remove your own profile');
        }
        const user = await this.findOne(id);
        await this.usersRepository.remove(user);
        return {
            id,
            deleted: true,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map