"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RentResponseDto = exports.RentEventResponseDto = void 0;
exports.serializeRent = serializeRent;
exports.serializeRentList = serializeRentList;
const user_response_serializer_1 = require("../../users/serializers/user-response.serializer");
const post_response_serializer_1 = require("../../posts/serializers/post-response.serializer");
class RentEventResponseDto {
    id;
    type;
    payload;
    createdAt;
}
exports.RentEventResponseDto = RentEventResponseDto;
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