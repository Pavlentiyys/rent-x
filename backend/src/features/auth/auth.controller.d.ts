import { AuthService } from './auth.service';
import { GenerateSiwsMessageDto } from './dto/generate-siws-message.dto';
import { VerifySiwsSignatureDto } from './dto/verify-siws-signature.dto';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { CurrentUserResponseDto } from '../users/serializers/user-response.serializer';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    generateSiwsMessage(dto: GenerateSiwsMessageDto): Promise<{
        wallet: string;
        message: string;
        expiresAt: Date;
    }>;
    verifySiwsSignature(dto: VerifySiwsSignatureDto): Promise<{
        access_token: string;
    }>;
    me(currentUser: AuthenticatedUser): Promise<CurrentUserResponseDto>;
}
