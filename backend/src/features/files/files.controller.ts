import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateFileUploadDto } from './dto/create-file-upload.dto';
import { FilesService } from './files.service';
import { serializeFileUploadResponse } from './serializers/file-upload-response.serializer';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

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
