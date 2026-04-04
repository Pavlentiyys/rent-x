import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class VerifyTransactionDto {
  @ApiProperty({ example: '5GJ8hNwqD4Yk...signature' })
  @IsString()
  @Length(32, 128)
  signature: string;
}
