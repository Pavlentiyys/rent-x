import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Matches, Max, Min } from 'class-validator';

export class CreateFileUploadDto {
  @ApiProperty({ example: 'camera.jpg' })
  @IsString()
  fileName: string;

  @ApiProperty({ example: 'image/jpeg' })
  @IsString()
  @Matches(/^[\w!#$&^.-]+\/[\w!#$&^.+-]+$/)
  contentType: string;

  @ApiProperty({ example: 524288 })
  @IsInt()
  @Min(1)
  @Max(10 * 1024 * 1024)
  size: number;
}
