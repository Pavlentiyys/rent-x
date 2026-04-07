import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateRentDto {
  @ApiProperty({ example: 42 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  postId: number;

  @ApiProperty({ example: '2026-04-15' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-04-17' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: '5J3mBbAH...' })
  @IsOptional()
  @IsString()
  paymentTxSignature?: string;
}
