import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class RentReasonDto {
  @ApiPropertyOptional({ example: 'Plans changed' })
  @IsOptional()
  @IsString()
  @Length(1, 1000)
  reason?: string;
}
