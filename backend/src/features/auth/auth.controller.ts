import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../common/swagger/api-common-error-responses.decorator';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { GenerateSiwsMessageDto } from './dto/generate-siws-message.dto';
import { VerifySiwsSignatureDto } from './dto/verify-siws-signature.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import {
  CurrentUserResponseDto,
  serializeCurrentUser,
} from '../users/serializers/user-response.serializer';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Generate SIWS message for wallet sign-in' })
  @ApiBody({ type: GenerateSiwsMessageDto })
  @ApiOkResponse({
    schema: {
      properties: {
        wallet: { type: 'string' },
        message: { type: 'string' },
        expiresAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiCommonErrorResponses(400, 401, 429)
  @Post('wallet/message')
  generateSiwsMessage(@Body() dto: GenerateSiwsMessageDto) {
    return this.authService.generateSiwsMessage(dto.wallet);
  }

  @ApiOperation({ summary: 'Verify SIWS signature and issue JWT' })
  @ApiBody({ type: VerifySiwsSignatureDto })
  @ApiOkResponse({
    schema: { properties: { access_token: { type: 'string' } } },
  })
  @ApiCommonErrorResponses(400, 401, 429)
  @Post('wallet/verify')
  verifySiwsSignature(@Body() dto: VerifySiwsSignatureDto) {
    return this.authService.verifySignature(
      dto.wallet,
      dto.message,
      dto.signature,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiOkResponse({ type: CurrentUserResponseDto })
  @ApiCommonErrorResponses(401, 404)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() currentUser: AuthenticatedUser) {
    return serializeCurrentUser(await this.authService.getMe(currentUser.userId));
  }
}
