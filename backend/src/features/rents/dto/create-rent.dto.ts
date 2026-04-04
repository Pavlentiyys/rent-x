import { Type } from 'class-transformer';
import { IsDateString, IsInt, Min } from 'class-validator';

export class CreateRentDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  postId: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
