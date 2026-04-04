import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { VerifyTransactionDto } from './dto/verify-transaction.dto';
import { PaymentsService } from './payments.service';
import {
  serializeTransactionVerification,
  serializeVerifiedRentPayment,
} from './serializers/payment-response.serializer';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('rents/:id/rent')
  verifyRentPayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: VerifyTransactionDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.paymentsService
      .verifyRentPayment(id, dto.signature, currentUser.userId, currentUser.wallet)
      .then(serializeVerifiedRentPayment);
  }

  @Post('rents/:id/deposit')
  verifyDepositPayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: VerifyTransactionDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.paymentsService
      .verifyDepositPayment(id, dto.signature, currentUser.userId, currentUser.wallet)
      .then(serializeVerifiedRentPayment);
  }

  @Post('rents/:id/return')
  verifyReturnPayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: VerifyTransactionDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.paymentsService
      .verifyReturnPayment(id, dto.signature, currentUser.userId, currentUser.wallet)
      .then(serializeVerifiedRentPayment);
  }

  @Get('transactions/:signature')
  inspectTransaction(
    @Param('signature') signature: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.paymentsService
      .inspectTransaction(signature, currentUser.wallet)
      .then(serializeTransactionVerification);
  }
}
