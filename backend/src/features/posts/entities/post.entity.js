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
exports.Post = exports.PostStatus = void 0;
const typeorm_1 = require("typeorm");
const rent_entity_1 = require("../../rents/entities/rent.entity");
const review_entity_1 = require("../../reviews/entities/review.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const post_attribute_entity_1 = require("./post-attribute.entity");
const post_image_entity_1 = require("./post-image.entity");
var PostStatus;
(function (PostStatus) {
    PostStatus["Draft"] = "draft";
    PostStatus["Active"] = "active";
    PostStatus["Paused"] = "paused";
    PostStatus["Rented"] = "rented";
    PostStatus["Archived"] = "archived";
})(PostStatus || (exports.PostStatus = PostStatus = {}));
let Post = class Post {
    id;
    ownerId;
    title;
    description;
    category;
    pricePerDay;
    depositAmount;
    currencyMint;
    location;
    status;
    availableFrom;
    availableTo;
    owner;
    attributes;
    images;
    rents;
    reviews;
    createdAt;
    updatedAt;
};
exports.Post = Post;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Post.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Post.prototype, "ownerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 160 }),
    __metadata("design:type", String)
], Post.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Post.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 80 }),
    __metadata("design:type", String)
], Post.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 6 }),
    __metadata("design:type", String)
], Post.prototype, "pricePerDay", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 6 }),
    __metadata("design:type", String)
], Post.prototype, "depositAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    __metadata("design:type", String)
], Post.prototype, "currencyMint", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], Post.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PostStatus,
        default: PostStatus.Draft,
    }),
    __metadata("design:type", String)
], Post.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Object)
], Post.prototype, "availableFrom", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Object)
], Post.prototype, "availableTo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.posts, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'ownerId' }),
    __metadata("design:type", user_entity_1.User)
], Post.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => post_attribute_entity_1.PostAttribute, (postAttribute) => postAttribute.post),
    __metadata("design:type", Array)
], Post.prototype, "attributes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => post_image_entity_1.PostImage, (postImage) => postImage.post),
    __metadata("design:type", Array)
], Post.prototype, "images", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => rent_entity_1.Rent, (rent) => rent.post),
    __metadata("design:type", Array)
], Post.prototype, "rents", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => review_entity_1.Review, (review) => review.post),
    __metadata("design:type", Array)
], Post.prototype, "reviews", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Post.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Post.prototype, "updatedAt", void 0);
exports.Post = Post = __decorate([
    (0, typeorm_1.Entity)({ name: 'posts' })
], Post);
//# sourceMappingURL=post.entity.js.map