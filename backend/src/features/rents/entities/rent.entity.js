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
exports.Rent = exports.RentStatus = void 0;
const typeorm_1 = require("typeorm");
const post_entity_1 = require("../../posts/entities/post.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const review_entity_1 = require("../../reviews/entities/review.entity");
const rent_event_entity_1 = require("./rent-event.entity");
var RentStatus;
(function (RentStatus) {
    RentStatus["Pending"] = "pending";
    RentStatus["Approved"] = "approved";
    RentStatus["Rejected"] = "rejected";
    RentStatus["Paid"] = "paid";
    RentStatus["Active"] = "active";
    RentStatus["Completed"] = "completed";
    RentStatus["Cancelled"] = "cancelled";
    RentStatus["Disputed"] = "disputed";
})(RentStatus || (exports.RentStatus = RentStatus = {}));
let Rent = class Rent {
    id;
    postId;
    ownerId;
    renterId;
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
    reviews;
    events;
    createdAt;
    updatedAt;
};
exports.Rent = Rent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Rent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Rent.prototype, "postId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Rent.prototype, "ownerId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Rent.prototype, "renterId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], Rent.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], Rent.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], Rent.prototype, "daysCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 6 }),
    __metadata("design:type", String)
], Rent.prototype, "pricePerDay", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 6 }),
    __metadata("design:type", String)
], Rent.prototype, "rentAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 6 }),
    __metadata("design:type", String)
], Rent.prototype, "depositAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 6, default: 0 }),
    __metadata("design:type", String)
], Rent.prototype, "platformFeeAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 6 }),
    __metadata("design:type", String)
], Rent.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    __metadata("design:type", String)
], Rent.prototype, "currencyMint", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 128, nullable: true }),
    __metadata("design:type", Object)
], Rent.prototype, "paymentTxSignature", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 128, nullable: true }),
    __metadata("design:type", Object)
], Rent.prototype, "depositTxSignature", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 128, nullable: true }),
    __metadata("design:type", Object)
], Rent.prototype, "returnTxSignature", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RentStatus,
        default: RentStatus.Pending,
    }),
    __metadata("design:type", String)
], Rent.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Rent.prototype, "cancelReason", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => post_entity_1.Post, (post) => post.rents, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'postId' }),
    __metadata("design:type", post_entity_1.Post)
], Rent.prototype, "post", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.ownerRents, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'ownerId' }),
    __metadata("design:type", user_entity_1.User)
], Rent.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.renterRents, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'renterId' }),
    __metadata("design:type", user_entity_1.User)
], Rent.prototype, "renter", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => review_entity_1.Review, (review) => review.rent),
    __metadata("design:type", Array)
], Rent.prototype, "reviews", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => rent_event_entity_1.RentEvent, (rentEvent) => rentEvent.rent),
    __metadata("design:type", Array)
], Rent.prototype, "events", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Rent.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Rent.prototype, "updatedAt", void 0);
exports.Rent = Rent = __decorate([
    (0, typeorm_1.Entity)({ name: 'rents' })
], Rent);
//# sourceMappingURL=rent.entity.js.map