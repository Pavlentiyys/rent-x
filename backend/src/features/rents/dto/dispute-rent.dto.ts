import { IsString, Length } from 'class-validator';

export class DisputeRentDto {
  @IsString()
  @Length(1, 1000)
  reason: string;
}
