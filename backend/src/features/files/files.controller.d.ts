import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateFileUploadDto } from './dto/create-file-upload.dto';
import { FilesService } from './files.service';
import { FileUploadResponseDto } from './serializers/file-upload-response.serializer';
export declare class FilesController {
    private readonly filesService;
    constructor(filesService: FilesService);
    createUploadUrl(dto: CreateFileUploadDto, currentUser: AuthenticatedUser): Promise<FileUploadResponseDto>;
}
