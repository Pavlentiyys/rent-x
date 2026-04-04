import { IsString, Length } from 'class-validator';

export class VerifyTransactionDto {
  @IsString()
  @Length(32, 128)
  signature: string;
}
