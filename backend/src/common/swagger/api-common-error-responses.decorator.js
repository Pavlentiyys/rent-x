"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiCommonErrorResponses = ApiCommonErrorResponses;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_error_response_dto_1 = require("../dto/api-error-response.dto");
function ApiCommonErrorResponses(...statuses) {
    const decorators = statuses.map((status) => {
        switch (status) {
            case 400:
                return (0, swagger_1.ApiBadRequestResponse)({ type: api_error_response_dto_1.ApiErrorResponseDto });
            case 401:
                return (0, swagger_1.ApiUnauthorizedResponse)({ type: api_error_response_dto_1.ApiErrorResponseDto });
            case 403:
                return (0, swagger_1.ApiForbiddenResponse)({ type: api_error_response_dto_1.ApiErrorResponseDto });
            case 404:
                return (0, swagger_1.ApiNotFoundResponse)({ type: api_error_response_dto_1.ApiErrorResponseDto });
            case 409:
                return (0, swagger_1.ApiConflictResponse)({ type: api_error_response_dto_1.ApiErrorResponseDto });
        }
    });
    return (0, common_1.applyDecorators)(...decorators);
}
//# sourceMappingURL=api-common-error-responses.decorator.js.map