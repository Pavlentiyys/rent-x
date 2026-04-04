import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
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
import { CreateRentDto } from './dto/create-rent.dto';
import { DisputeRentDto } from './dto/dispute-rent.dto';
import { RejectRentDto } from './dto/reject-rent.dto';
import { RentReasonDto } from './dto/rent-reason.dto';
import { RentsService } from './rents.service';
import {
  RentResponseDto,
  serializeRent,
  serializeRentList,
} from './serializers/rent-response.serializer';

@ApiTags('rents')
@ApiBearerAuth()
@Controller('rents')
@UseGuards(JwtAuthGuard)
export class RentsController {
  constructor(private readonly rentsService: RentsService) {}

  @ApiOperation({ summary: 'Create a rent request' })
  @ApiOkResponse({ type: RentResponseDto })
  @ApiCommonErrorResponses(400, 401, 404, 409)
  @Post()
  create(@Body() dto: CreateRentDto, @CurrentUser() currentUser: AuthenticatedUser) {
    return this.rentsService.create(dto, currentUser.userId).then(serializeRent);
  }

  @ApiOperation({ summary: 'List current user rents' })
  @ApiOkResponse({ type: RentResponseDto, isArray: true })
  @Get()
  findAll(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.rentsService.findAll(currentUser.userId).then(serializeRentList);
  }

  @ApiOperation({ summary: 'Get rent details by id' })
  @ApiOkResponse({ type: RentResponseDto })
  @ApiCommonErrorResponses(401, 403, 404)
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.rentsService.findOne(id, currentUser.userId).then(serializeRent);
  }

  @ApiOperation({ summary: 'Approve pending rent' })
  @ApiOkResponse({ type: RentResponseDto })
  @ApiCommonErrorResponses(401, 403, 404, 409)
  @Post(':id/approve')
  approve(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.rentsService.approve(id, currentUser.userId).then(serializeRent);
  }

  @ApiOperation({ summary: 'Reject pending rent' })
  @ApiOkResponse({ type: RentResponseDto })
  @ApiCommonErrorResponses(400, 401, 403, 404, 409)
  @Post(':id/reject')
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectRentDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.rentsService
      .reject(id, dto.reason, currentUser.userId)
      .then(serializeRent);
  }

  @ApiOperation({ summary: 'Mark approved rent as paid' })
  @ApiOkResponse({ type: RentResponseDto })
  @ApiCommonErrorResponses(401, 403, 404, 409)
  @Post(':id/mark-paid')
  markPaid(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.rentsService.markPaid(id, currentUser.userId).then(serializeRent);
  }

  @ApiOperation({ summary: 'Confirm handover and activate rent' })
  @ApiOkResponse({ type: RentResponseDto })
  @ApiCommonErrorResponses(401, 403, 404, 409)
  @Post(':id/handover')
  handover(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.rentsService.handover(id, currentUser.userId).then(serializeRent);
  }

  @ApiOperation({ summary: 'Complete active or disputed rent' })
  @ApiOkResponse({ type: RentResponseDto })
  @ApiCommonErrorResponses(401, 403, 404, 409)
  @Post(':id/complete')
  complete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.rentsService.complete(id, currentUser.userId).then(serializeRent);
  }

  @ApiOperation({ summary: 'Cancel pending or approved rent' })
  @ApiOkResponse({ type: RentResponseDto })
  @ApiCommonErrorResponses(400, 401, 403, 404, 409)
  @Post(':id/cancel')
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RentReasonDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.rentsService.cancel(id, dto.reason, currentUser.userId).then(serializeRent);
  }

  @ApiOperation({ summary: 'Open dispute for active rent' })
  @ApiOkResponse({ type: RentResponseDto })
  @ApiCommonErrorResponses(400, 401, 403, 404, 409)
  @Post(':id/dispute')
  dispute(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DisputeRentDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.rentsService.dispute(id, dto.reason, currentUser.userId).then(serializeRent);
  }

  @ApiOperation({ summary: 'Delete non-active rent record' })
  @ApiOkResponse({
    schema: { properties: { id: { type: 'number' }, deleted: { type: 'boolean' } } },
  })
  @ApiCommonErrorResponses(401, 403, 404, 409)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.rentsService.remove(id, currentUser.userId);
  }
}
