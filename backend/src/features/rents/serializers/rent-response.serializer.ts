import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  serializeUserProfile,
  UserProfileResponseDto,
} from '../../users/serializers/user-response.serializer';
import { serializePost, PostResponseDto } from '../../posts/serializers/post-response.serializer';
import { RentEvent } from '../entities/rent-event.entity';
import { Rent } from '../entities/rent.entity';

export class RentEventResponseDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  type: string;
  @ApiPropertyOptional({ nullable: true })
  payload: Record<string, unknown> | null;
  @ApiProperty()
  createdAt: string;
}

export class RentResponseDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  startDate: string;
  @ApiProperty()
  endDate: string;
  @ApiProperty()
  daysCount: number;
  @ApiProperty()
  pricePerDay: string;
  @ApiProperty()
  rentAmount: string;
  @ApiProperty()
  depositAmount: string;
  @ApiProperty()
  platformFeeAmount: string;
  @ApiProperty()
  totalAmount: string;
  @ApiProperty()
  currencyMint: string;
  @ApiPropertyOptional({ nullable: true })
  paymentTxSignature: string | null;
  @ApiPropertyOptional({ nullable: true })
  depositTxSignature: string | null;
  @ApiPropertyOptional({ nullable: true })
  returnTxSignature: string | null;
  @ApiProperty()
  status: string;
  @ApiPropertyOptional({ nullable: true })
  cancelReason: string | null;
  @ApiPropertyOptional({ type: PostResponseDto, nullable: true })
  post: PostResponseDto | null;
  @ApiPropertyOptional({ type: UserProfileResponseDto, nullable: true })
  owner: UserProfileResponseDto | null;
  @ApiPropertyOptional({ type: UserProfileResponseDto, nullable: true })
  renter: UserProfileResponseDto | null;
  @ApiProperty()
  reviewsCount: number;
  @ApiProperty({ type: [RentEventResponseDto] })
  events: RentEventResponseDto[];
  @ApiProperty()
  createdAt: string;
  @ApiProperty()
  updatedAt: string;
}

export function serializeRent(rent: Rent): RentResponseDto {
  return {
    id: rent.id,
    startDate: rent.startDate,
    endDate: rent.endDate,
    daysCount: rent.daysCount,
    pricePerDay: rent.pricePerDay,
    rentAmount: rent.rentAmount,
    depositAmount: rent.depositAmount,
    platformFeeAmount: rent.platformFeeAmount,
    totalAmount: rent.totalAmount,
    currencyMint: rent.currencyMint,
    paymentTxSignature: rent.paymentTxSignature,
    depositTxSignature: rent.depositTxSignature,
    returnTxSignature: rent.returnTxSignature,
    status: rent.status,
    cancelReason: rent.cancelReason,
    post: rent.post ? serializePost(rent.post) : null,
    owner: rent.owner ? serializeUserProfile(rent.owner) : null,
    renter: rent.renter ? serializeUserProfile(rent.renter) : null,
    reviewsCount: rent.reviews?.length ?? 0,
    events: [...(rent.events ?? [])]
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map(serializeRentEvent),
    createdAt: rent.createdAt.toISOString(),
    updatedAt: rent.updatedAt.toISOString(),
  };
}

export function serializeRentList(rents: Rent[]) {
  return rents.map(serializeRent);
}

function serializeRentEvent(event: RentEvent): RentEventResponseDto {
  return {
    id: event.id,
    type: event.type,
    payload: event.payload,
    createdAt: event.createdAt.toISOString(),
  };
}
