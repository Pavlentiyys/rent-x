import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UpdateReviewDto {
  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ example: 'Updated feedback after the return' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}
