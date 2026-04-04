import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class RejectRentDto {
  @ApiProperty({ example: 'Dates are no longer available' })
  @IsString()
  @Length(1, 1000)
  reason: string;
}
