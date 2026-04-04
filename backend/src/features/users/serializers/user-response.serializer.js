"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUserResponseDto = exports.UserProfileResponseDto = void 0;
exports.serializeUserProfile = serializeUserProfile;
exports.serializeCurrentUser = serializeCurrentUser;
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
class CurrentUserResponseDto extends UserProfileResponseDto {
    walletAddress;
}
exports.CurrentUserResponseDto = CurrentUserResponseDto;
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