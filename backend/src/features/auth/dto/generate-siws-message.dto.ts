import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class GenerateSiwsMessageDto {
  @ApiProperty({ example: '7YyZgM3j2g8G1V4qkQYJx9hQW3s9bL1u2x6R7t8p9Qa' })
  @IsString()
  @Matches(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)
  wallet: string;
}
