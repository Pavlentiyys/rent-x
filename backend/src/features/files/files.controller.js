"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_common_error_responses_decorator_1 = require("../../common/swagger/api-common-error-responses.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const create_file_upload_dto_1 = require("./dto/create-file-upload.dto");
const files_service_1 = require("./files.service");
const file_upload_response_serializer_1 = require("./serializers/file-upload-response.serializer");
let FilesController = class FilesController {
    filesService;
    constructor(filesService) {
        this.filesService = filesService;
    }
    createUploadUrl(dto, currentUser) {
        return this.filesService
            .createUploadUrl(dto, currentUser.userId)
            .then(file_upload_response_serializer_1.serializeFileUploadResponse);
    }
};
exports.FilesController = FilesController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Generate presigned upload URL for Minio object' }),
    (0, swagger_1.ApiOkResponse)({ type: file_upload_response_serializer_1.FileUploadResponseDto }),
    (0, api_common_error_responses_decorator_1.ApiCommonErrorResponses)(400, 401),
    (0, common_1.Post)('upload-url'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_file_upload_dto_1.CreateFileUploadDto, Object]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "createUploadUrl", null);
exports.FilesController = FilesController = __decorate([
    (0, swagger_1.ApiTags)('files'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('files'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [files_service_1.FilesService])
], FilesController);
//# sourceMappingURL=files.controller.js.map