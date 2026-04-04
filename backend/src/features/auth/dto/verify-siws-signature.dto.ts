import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class VerifySiwsSignatureDto {
  @ApiProperty({ example: '7YyZgM3j2g8G1V4qkQYJx9hQW3s9bL1u2x6R7t8p9Qa' })
  @IsString()
  @Matches(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)
  wallet: string;

  @ApiProperty({ example: 'RentX wants you to sign in with your Solana account:\n...' })
  @IsString()
  @Length(32, 2000)
  message: string;

  @ApiProperty({ example: '3WNw3tXgWQ4g3pM4z...' })
  @IsString()
  @Length(32, 256)
  signature: string;
}
