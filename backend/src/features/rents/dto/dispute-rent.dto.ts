import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class DisputeRentDto {
  @ApiProperty({ example: 'Item returned with visible damage' })
  @IsString()
  @Length(1, 1000)
  reason: string;
}
