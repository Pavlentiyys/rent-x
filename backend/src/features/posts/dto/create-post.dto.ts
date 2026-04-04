import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { PostAttributeType } from '../entities/post-attribute.entity';
import { PostStatus } from '../entities/post.entity';

export class CreatePostAttributeDto {
  @IsString()
  @Length(1, 100)
  key: string;

  @IsString()
  @MaxLength(5000)
  value: string;

  @IsEnum(PostAttributeType)
  type: 'string' | 'number' | 'boolean' | 'json';
}

export class CreatePostImageDto {
  @IsString()
  @Length(1, 255)
  objectKey: string;

  @IsUrl()
  url: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class CreatePostDto {
  @IsString()
  @Length(3, 160)
  title: string;

  @IsString()
  @MaxLength(10000)
  description: string;

  @IsString()
  @Length(1, 80)
  category: string;

  @IsString()
  @Matches(/^\d+(\.\d{1,6})?$/)
  pricePerDay: string;

  @IsString()
  @Matches(/^\d+(\.\d{1,6})?$/)
  depositAmount: string;

  @IsString()
  @Matches(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)
  currencyMint: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @IsDateString()
  availableFrom?: string;

  @IsOptional()
  @IsDateString()
  availableTo?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CreatePostAttributeDto)
  attributes?: CreatePostAttributeDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => CreatePostImageDto)
  images?: CreatePostImageDto[];
}
