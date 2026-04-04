import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { RentsModule } from '../rents/rents.module';
import { RentEvent } from '../rents/entities/rent-event.entity';
import { Rent } from '../rents/entities/rent.entity';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [AuthModule, RentsModule, TypeOrmModule.forFeature([Rent, RentEvent])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
