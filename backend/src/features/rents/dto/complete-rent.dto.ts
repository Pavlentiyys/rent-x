import { IsOptional, IsString, Length } from 'class-validator';

export class CompleteRentDto {
  @IsOptional()
  @IsString()
  @Length(32, 128)
  returnTxSignature?: string;
}
