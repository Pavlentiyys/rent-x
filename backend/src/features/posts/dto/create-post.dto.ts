import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({ example: 'brand' })
  @IsString()
  @Length(1, 100)
  key: string;

  @ApiProperty({ example: 'Sony' })
  @IsString()
  @MaxLength(5000)
  value: string;

  @ApiProperty({ enum: PostAttributeType })
  @IsEnum(PostAttributeType)
  type: 'string' | 'number' | 'boolean' | 'json';
}

export class CreatePostImageDto {
  @ApiProperty({ example: 'posts/1/camera.jpg' })
  @IsString()
  @Length(1, 255)
  objectKey: string;

  @ApiProperty({ example: 'https://files.example.com/posts/1/camera.jpg' })
  @IsUrl({ require_tld: false })
  url: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class CreatePostDto {
  @ApiProperty({ example: 'Sony A7 IV' })
  @IsString()
  @Length(3, 160)
  title: string;

  @ApiProperty({ example: 'Full-frame mirrorless camera for rent' })
  @IsString()
  @MaxLength(10000)
  description: string;

  @ApiProperty({ example: 'electronics' })
  @IsString()
  @Length(1, 80)
  category: string;

  @ApiProperty({ example: '15.000000' })
  @IsString()
  @Matches(/^\d+(\.\d{1,6})?$/)
  pricePerDay: string;

  @ApiProperty({ example: '50.000000' })
  @IsString()
  @Matches(/^\d+(\.\d{1,6})?$/)
  depositAmount: string;

  @ApiProperty({ example: 'So11111111111111111111111111111111111111112' })
  @IsString()
  @Matches(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)
  currencyMint: string;

  @ApiPropertyOptional({ example: 'Berlin' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({ example: 'Telegram: @username, WhatsApp: +7 777 123 45 67' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  contactInfo?: string;

  @ApiPropertyOptional({ enum: PostStatus })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ApiPropertyOptional({ example: '2026-04-10T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  availableFrom?: string;

  @ApiPropertyOptional({ example: '2026-04-20T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  availableTo?: string;

  @ApiPropertyOptional({ type: [CreatePostAttributeDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CreatePostAttributeDto)
  attributes?: CreatePostAttributeDto[];

  @ApiPropertyOptional({ type: [CreatePostImageDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => CreatePostImageDto)
  images?: CreatePostImageDto[];
}
