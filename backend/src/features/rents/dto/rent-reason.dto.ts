import { IsOptional, IsString, Length } from 'class-validator';

export class RentReasonDto {
  @IsOptional()
  @IsString()
  @Length(1, 1000)
  reason?: string;
}
