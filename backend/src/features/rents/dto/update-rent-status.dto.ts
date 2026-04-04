import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { RentStatus } from '../entities/rent.entity';

export class UpdateRentStatusDto {
  @IsEnum(RentStatus)
  status: RentStatus;

  @IsOptional()
  @IsString()
  @Length(1, 1000)
  cancelReason?: string;

  @IsOptional()
  @IsString()
  @Length(32, 128)
  paymentTxSignature?: string;

  @IsOptional()
  @IsString()
  @Length(32, 128)
  depositTxSignature?: string;

  @IsOptional()
  @IsString()
  @Length(32, 128)
  returnTxSignature?: string;
}
