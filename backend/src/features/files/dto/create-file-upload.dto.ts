import { IsInt, IsString, Matches, Max, Min } from 'class-validator';

export class CreateFileUploadDto {
  @IsString()
  fileName: string;

  @IsString()
  @Matches(/^[\w!#$&^.-]+\/[\w!#$&^.+-]+$/)
  contentType: string;

  @IsInt()
  @Min(1)
  @Max(10 * 1024 * 1024)
  size: number;
}
