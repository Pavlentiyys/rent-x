import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { GenerateSiwsMessageDto } from './dto/generate-siws-message.dto';
import { VerifySiwsSignatureDto } from './dto/verify-siws-signature.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { serializeCurrentUser } from '../users/serializers/user-response.serializer';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('wallet/message')
  generateSiwsMessage(@Body() dto: GenerateSiwsMessageDto) {
    return this.authService.generateSiwsMessage(dto.wallet);
  }

  @Post('wallet/verify')
  verifySiwsSignature(@Body() dto: VerifySiwsSignatureDto) {
    return this.authService.verifySignature(
      dto.wallet,
      dto.message,
      dto.signature,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() currentUser: AuthenticatedUser) {
    return serializeCurrentUser(await this.authService.getMe(currentUser.userId));
  }
}
