import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class PostActionDto {
  @ApiPropertyOptional({ example: 'Temporarily unavailable' })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  reason?: string;
}
