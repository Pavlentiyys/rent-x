import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiErrorResponseDto } from '../dto/api-error-response.dto';

type SupportedErrorStatus = 400 | 401 | 403 | 404 | 409 | 429;

export function ApiCommonErrorResponses(...statuses: SupportedErrorStatus[]) {
  const decorators = statuses.map((status) => {
    switch (status) {
      case 400:
        return ApiBadRequestResponse({ type: ApiErrorResponseDto });
      case 401:
        return ApiUnauthorizedResponse({ type: ApiErrorResponseDto });
      case 403:
        return ApiForbiddenResponse({ type: ApiErrorResponseDto });
      case 404:
        return ApiNotFoundResponse({ type: ApiErrorResponseDto });
      case 409:
        return ApiConflictResponse({ type: ApiErrorResponseDto });
      case 429:
        return ApiTooManyRequestsResponse({ type: ApiErrorResponseDto });
    }
  });

  return applyDecorators(...decorators);
}
