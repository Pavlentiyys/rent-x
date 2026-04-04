import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './features/auth/auth.module';
import { FilesModule } from './features/files/files.module';
import { PaymentsModule } from './features/payments/payments.module';
import { PostsModule } from './features/posts/posts.module';
import { RentsModule } from './features/rents/rents.module';
import { ReviewsModule } from './features/reviews/reviews.module';
import { UsersModule } from './features/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
