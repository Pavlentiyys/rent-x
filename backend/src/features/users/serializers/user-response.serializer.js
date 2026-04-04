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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUserResponseDto = exports.UserProfileResponseDto = void 0;
exports.serializeUserProfile = serializeUserProfile;
exports.serializeCurrentUser = serializeCurrentUser;
const swagger_1 = require("@nestjs/swagger");
class UserProfileResponseDto {
    id;
    username;
    displayName;
    avatarUrl;
    bio;
    rating;
    reviewsCount;
    isVerified;
    createdAt;
    updatedAt;
}
exports.UserProfileResponseDto = UserProfileResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], UserProfileResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    __metadata("design:type", Object)
], UserProfileResponseDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    __metadata("design:type", Object)
], UserProfileResponseDto.prototype, "displayName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    __metadata("design:type", Object)
], UserProfileResponseDto.prototype, "avatarUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    __metadata("design:type", Object)
], UserProfileResponseDto.prototype, "bio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], UserProfileResponseDto.prototype, "rating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], UserProfileResponseDto.prototype, "reviewsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], UserProfileResponseDto.prototype, "isVerified", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "updatedAt", void 0);
class CurrentUserResponseDto extends UserProfileResponseDto {
    walletAddress;
}
exports.CurrentUserResponseDto = CurrentUserResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CurrentUserResponseDto.prototype, "walletAddress", void 0);
function serializeUserProfile(user) {
    return {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        rating: Number(user.rating),
        reviewsCount: user.reviewsCount,
        isVerified: user.isVerified,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    };
}
function serializeCurrentUser(user) {
    return {
        ...serializeUserProfile(user),
        walletAddress: user.walletAddress,
    };
}
//# sourceMappingURL=user-response.serializer.js.map