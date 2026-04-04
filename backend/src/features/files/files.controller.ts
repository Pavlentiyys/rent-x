import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../common/swagger/api-common-error-responses.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateFileUploadDto } from './dto/create-file-upload.dto';
import { FilesService } from './files.service';
import {
  FileUploadResponseDto,
  serializeFileUploadResponse,
} from './serializers/file-upload-response.serializer';

@ApiTags('files')
@ApiBearerAuth()
@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @ApiOperation({ summary: 'Generate presigned upload URL for Minio object' })
  @ApiOkResponse({ type: FileUploadResponseDto })
  @ApiCommonErrorResponses(400, 401)
  @Post('upload-url')
  createUploadUrl(
    @Body() dto: CreateFileUploadDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.filesService
      .createUploadUrl(dto, currentUser.userId)
      .then(serializeFileUploadResponse);
  }
}
