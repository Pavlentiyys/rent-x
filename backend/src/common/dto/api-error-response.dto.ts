import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorResponseDto {
  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({ example: 'Not Found' })
  error: string;

  @ApiProperty({
    oneOf: [
      { type: 'string', example: 'Resource not found' },
      { type: 'array', items: { type: 'string' }, example: ['field must be a string'] },
    ],
  })
  message: string | string[];

  @ApiProperty({ example: '/posts/42' })
  path: string;

  @ApiProperty({ example: '2026-04-05T12:00:00.000Z' })
  timestamp: string;
}
