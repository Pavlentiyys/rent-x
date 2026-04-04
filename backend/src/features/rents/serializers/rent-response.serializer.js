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
exports.RentResponseDto = exports.RentEventResponseDto = void 0;
exports.serializeRent = serializeRent;
exports.serializeRentList = serializeRentList;
const swagger_1 = require("@nestjs/swagger");
const user_response_serializer_1 = require("../../users/serializers/user-response.serializer");
const post_response_serializer_1 = require("../../posts/serializers/post-response.serializer");
class RentEventResponseDto {
    id;
    type;
    payload;
    createdAt;
}
exports.RentEventResponseDto = RentEventResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], RentEventResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RentEventResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    __metadata("design:type", Object)
], RentEventResponseDto.prototype, "payload", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RentEventResponseDto.prototype, "createdAt", void 0);
class RentResponseDto {
    id;
    startDate;
    endDate;
    daysCount;
    pricePerDay;
    rentAmount;
    depositAmount;
    platformFeeAmount;
    totalAmount;
    currencyMint;
    paymentTxSignature;
    depositTxSignature;
    returnTxSignature;
    status;
    cancelReason;
    post;
    owner;
    renter;
    reviewsCount;
    events;
    createdAt;
    updatedAt;
}
exports.RentResponseDto = RentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], RentResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RentResponseDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RentResponseDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], RentResponseDto.prototype, "daysCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RentResponseDto.prototype, "pricePerDay", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RentResponseDto.prototype, "rentAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RentResponseDto.prototype, "depositAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RentResponseDto.prototype, "platformFeeAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RentResponseDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RentResponseDto.prototype, "currencyMint", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    __metadata("design:type", Object)
], RentResponseDto.prototype, "paymentTxSignature", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    __metadata("design:type", Object)
], RentResponseDto.prototype, "depositTxSignature", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    __metadata("design:type", Object)
], RentResponseDto.prototype, "returnTxSignature", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RentResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    __metadata("design:type", Object)
], RentResponseDto.prototype, "cancelReason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: post_response_serializer_1.PostResponseDto, nullable: true }),
    __metadata("design:type", Object)
], RentResponseDto.prototype, "post", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: user_response_serializer_1.UserProfileResponseDto, nullable: true }),
    __metadata("design:type", Object)
], RentResponseDto.prototype, "owner", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: user_response_serializer_1.UserProfileResponseDto, nullable: true }),
    __metadata("design:type", Object)
], RentResponseDto.prototype, "renter", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], RentResponseDto.prototype, "reviewsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [RentEventResponseDto] }),
    __metadata("design:type", Array)
], RentResponseDto.prototype, "events", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RentResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RentResponseDto.prototype, "updatedAt", void 0);
function serializeRent(rent) {
    return {
        id: rent.id,
        startDate: rent.startDate,
        endDate: rent.endDate,
        daysCount: rent.daysCount,
        pricePerDay: rent.pricePerDay,
        rentAmount: rent.rentAmount,
        depositAmount: rent.depositAmount,
        platformFeeAmount: rent.platformFeeAmount,
        totalAmount: rent.totalAmount,
        currencyMint: rent.currencyMint,
        paymentTxSignature: rent.paymentTxSignature,
        depositTxSignature: rent.depositTxSignature,
        returnTxSignature: rent.returnTxSignature,
        status: rent.status,
        cancelReason: rent.cancelReason,
        post: rent.post ? (0, post_response_serializer_1.serializePost)(rent.post) : null,
        owner: rent.owner ? (0, user_response_serializer_1.serializeUserProfile)(rent.owner) : null,
        renter: rent.renter ? (0, user_response_serializer_1.serializeUserProfile)(rent.renter) : null,
        reviewsCount: rent.reviews?.length ?? 0,
        events: [...(rent.events ?? [])]
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
            .map(serializeRentEvent),
        createdAt: rent.createdAt.toISOString(),
        updatedAt: rent.updatedAt.toISOString(),
    };
}
function serializeRentList(rents) {
    return rents.map(serializeRent);
}
function serializeRentEvent(event) {
    return {
        id: event.id,
        type: event.type,
        payload: event.payload,
        createdAt: event.createdAt.toISOString(),
    };
}
//# sourceMappingURL=rent-response.serializer.js.map