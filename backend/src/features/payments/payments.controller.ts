import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../common/swagger/api-common-error-responses.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { VerifyTransactionDto } from './dto/verify-transaction.dto';
import { PaymentsService } from './payments.service';
import {
  TransactionVerificationResponseDto,
  VerifiedRentPaymentResponseDto,
  serializeTransactionVerification,
  serializeVerifiedRentPayment,
} from './serializers/payment-response.serializer';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiOperation({ summary: 'Verify and attach rent payment transaction' })
  @ApiOkResponse({ type: VerifiedRentPaymentResponseDto })
  @ApiCommonErrorResponses(400, 401, 403, 404, 409)
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

  @ApiOperation({ summary: 'Verify and attach deposit payment transaction' })
  @ApiOkResponse({ type: VerifiedRentPaymentResponseDto })
  @ApiCommonErrorResponses(400, 401, 403, 404, 409)
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

  @ApiOperation({ summary: 'Verify and attach return payment transaction' })
  @ApiOkResponse({ type: VerifiedRentPaymentResponseDto })
  @ApiCommonErrorResponses(400, 401, 403, 404, 409)
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

  @ApiOperation({ summary: 'Inspect Solana transaction visible to current signer' })
  @ApiOkResponse({ type: TransactionVerificationResponseDto })
  @ApiCommonErrorResponses(400, 401, 404, 409)
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
