"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RentsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const post_entity_1 = require("../posts/entities/post.entity");
const user_entity_1 = require("../users/entities/user.entity");
const rent_event_entity_1 = require("./entities/rent-event.entity");
const rent_entity_1 = require("./entities/rent.entity");
const rents_controller_1 = require("./rents.controller");
const rents_service_1 = require("./rents.service");
let RentsModule = class RentsModule {
};
exports.RentsModule = RentsModule;
exports.RentsModule = RentsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([rent_entity_1.Rent, rent_event_entity_1.RentEvent, post_entity_1.Post, user_entity_1.User])],
        controllers: [rents_controller_1.RentsController],
        providers: [rents_service_1.RentsService],
        exports: [rents_service_1.RentsService],
    })
], RentsModule);
//# sourceMappingURL=rents.module.js.map