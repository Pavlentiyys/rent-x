import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestContextMiddleware } from './common/middleware/request-context.middleware';
import { validateEnvironment } from './config/environment.validation';
import { AuthRateLimitMiddleware } from './features/auth/middleware/auth-rate-limit.middleware';
import { AuthModule } from './features/auth/auth.module';
import { FilesModule } from './features/files/files.module';
import { PaymentsModule } from './features/payments/payments.module';
import { PostsModule } from './features/posts/posts.module';
import { RentsModule } from './features/rents/rents.module';
import { ReviewsModule } from './features/reviews/reviews.module';
import { UsersModule } from './features/users/users.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnvironment,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        port: Number(configService.get<string>('DATABASE_PORT', '5432')),
        username: configService.get<string>('DATABASE_USER', 'rentx'),
        password: configService.get<string>('DATABASE_PASSWORD', 'rentx'),
        database: configService.get<string>('DATABASE_NAME', 'rentx'),
        autoLoadEntities: true,
        synchronize:
          configService.get<string>('DATABASE_SYNCHRONIZE', 'true') === 'true',
      }),
    }),
    AuthModule,
    FilesModule,
    PaymentsModule,
    PostsModule,
    RentsModule,
    ReviewsModule,
    UsersModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestContextMiddleware)
      .forRoutes({
        path: '*',
        method: RequestMethod.ALL,
      });

    consumer.apply(AuthRateLimitMiddleware).forRoutes(
      { path: 'auth/wallet/message', method: RequestMethod.POST },
      { path: 'auth/wallet/verify', method: RequestMethod.POST },
    );
  }
}
