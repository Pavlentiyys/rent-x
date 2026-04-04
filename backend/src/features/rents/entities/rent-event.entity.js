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
exports.RentEvent = void 0;
const typeorm_1 = require("typeorm");
const rent_entity_1 = require("./rent.entity");
let RentEvent = class RentEvent {
    id;
    rentId;
    type;
    payload;
    rent;
    createdAt;
};
exports.RentEvent = RentEvent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], RentEvent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], RentEvent.prototype, "rentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 80 }),
    __metadata("design:type", String)
], RentEvent.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], RentEvent.prototype, "payload", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => rent_entity_1.Rent, (rent) => rent.events, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'rentId' }),
    __metadata("design:type", rent_entity_1.Rent)
], RentEvent.prototype, "rent", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RentEvent.prototype, "createdAt", void 0);
exports.RentEvent = RentEvent = __decorate([
    (0, typeorm_1.Entity)({ name: 'rent_events' })
], RentEvent);
//# sourceMappingURL=rent-event.entity.js.map