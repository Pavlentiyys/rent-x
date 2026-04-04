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
exports.SearchPostsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const post_entity_1 = require("../entities/post.entity");
class SearchPostsDto {
    category;
    location;
    search;
    status;
    minPricePerDay;
    maxPricePerDay;
    availableFrom;
    availableTo;
    page;
    limit;
    sortBy;
    sortOrder;
}
exports.SearchPostsDto = SearchPostsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'electronics' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 80),
    __metadata("design:type", String)
], SearchPostsDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Berlin' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 255),
    __metadata("design:type", String)
], SearchPostsDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'camera' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 160),
    __metadata("design:type", String)
], SearchPostsDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: post_entity_1.PostStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(post_entity_1.PostStatus),
    __metadata("design:type", String)
], SearchPostsDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 6 }),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(999999999),
    __metadata("design:type", Number)
], SearchPostsDto.prototype, "minPricePerDay", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 50 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 6 }),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(999999999),
    __metadata("design:type", Number)
], SearchPostsDto.prototype, "maxPricePerDay", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-04-10T00:00:00.000Z' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SearchPostsDto.prototype, "availableFrom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-04-20T00:00:00.000Z' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SearchPostsDto.prototype, "availableTo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SearchPostsDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], SearchPostsDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['createdAt', 'pricePerDay'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['createdAt', 'pricePerDay']),
    __metadata("design:type", String)
], SearchPostsDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['ASC', 'DESC'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['ASC', 'DESC']),
    __metadata("design:type", String)
], SearchPostsDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=search-posts.dto.js.map