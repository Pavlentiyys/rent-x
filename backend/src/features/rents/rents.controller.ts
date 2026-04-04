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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateRentDto } from './dto/create-rent.dto';
import { DisputeRentDto } from './dto/dispute-rent.dto';
import { RejectRentDto } from './dto/reject-rent.dto';
import { RentReasonDto } from './dto/rent-reason.dto';
import { RentsService } from './rents.service';

@Controller('rents')
@UseGuards(JwtAuthGuard)
export class RentsController {
  constructor(private readonly rentsService: RentsService) {}

  @Post()
  create(@Body() dto: CreateRentDto, @CurrentUser() currentUser: AuthenticatedUser) {
    return this.rentsService.create(dto, currentUser.userId);
  }

  @Get()
  findAll(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.rentsService.findAll(currentUser.userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.rentsService.findOne(id, currentUser.userId);
  }

  @Post(':id/approve')
  approve(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.rentsService.approve(id, currentUser.userId);
  }

  @Post(':id/reject')
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectRentDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.rentsService.reject(id, dto.reason, currentUser.userId);
  }

  @Post(':id/mark-paid')
  markPaid(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.rentsService.markPaid(id, currentUser.userId);
  }

  @Post(':id/handover')
  handover(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.rentsService.handover(id, currentUser.userId);
  }

  @Post(':id/complete')
  complete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.rentsService.complete(id, currentUser.userId);
  }

  @Post(':id/cancel')
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RentReasonDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.rentsService.cancel(id, dto.reason, currentUser.userId);
  }

  @Post(':id/dispute')
  dispute(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DisputeRentDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.rentsService.dispute(id, dto.reason, currentUser.userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.rentsService.remove(id, currentUser.userId);
  }
}
