"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const request_context_middleware_1 = require("./common/middleware/request-context.middleware");
const environment_validation_1 = require("./config/environment.validation");
const auth_module_1 = require("./features/auth/auth.module");
const files_module_1 = require("./features/files/files.module");
const payments_module_1 = require("./features/payments/payments.module");
const posts_module_1 = require("./features/posts/posts.module");
const rents_module_1 = require("./features/rents/rents.module");
const reviews_module_1 = require("./features/reviews/reviews.module");
const users_module_1 = require("./features/users/users.module");
const health_module_1 = require("./health/health.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(request_context_middleware_1.RequestContextMiddleware).forRoutes({
            path: '*',
            method: common_1.RequestMethod.ALL,
        });
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
                validate: environment_validation_1.validateEnvironment,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DATABASE_HOST', 'localhost'),
                    port: Number(configService.get('DATABASE_PORT', '5432')),
                    username: configService.get('DATABASE_USER', 'rentx'),
                    password: configService.get('DATABASE_PASSWORD', 'rentx'),
                    database: configService.get('DATABASE_NAME', 'rentx'),
                    autoLoadEntities: true,
                    synchronize: configService.get('DATABASE_SYNCHRONIZE', 'true') === 'true',
                }),
            }),
            auth_module_1.AuthModule,
            files_module_1.FilesModule,
            payments_module_1.PaymentsModule,
            posts_module_1.PostsModule,
            rents_module_1.RentsModule,
            reviews_module_1.ReviewsModule,
            users_module_1.UsersModule,
            health_module_1.HealthModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map