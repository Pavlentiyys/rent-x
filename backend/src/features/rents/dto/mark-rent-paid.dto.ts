import { IsOptional, IsString, Length } from 'class-validator';

export class MarkRentPaidDto {
  @IsString()
  @Length(32, 128)
  paymentTxSignature: string;

  @IsOptional()
  @IsString()
  @Length(32, 128)
  depositTxSignature?: string;
}
