import { IsString, Length } from 'class-validator';

export class RejectRentDto {
  @IsString()
  @Length(1, 1000)
  reason: string;
}
