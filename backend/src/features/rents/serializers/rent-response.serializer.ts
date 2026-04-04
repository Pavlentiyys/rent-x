import {
  serializeUserProfile,
  UserProfileResponseDto,
} from '../../users/serializers/user-response.serializer';
import { serializePost, PostResponseDto } from '../../posts/serializers/post-response.serializer';
import { RentEvent } from '../entities/rent-event.entity';
import { Rent } from '../entities/rent.entity';

export class RentEventResponseDto {
  id: number;
  type: string;
  payload: Record<string, unknown> | null;
  createdAt: string;
}

export class RentResponseDto {
  id: number;
  startDate: string;
  endDate: string;
  daysCount: number;
  pricePerDay: string;
  rentAmount: string;
  depositAmount: string;
  platformFeeAmount: string;
  totalAmount: string;
  currencyMint: string;
  paymentTxSignature: string | null;
  depositTxSignature: string | null;
  returnTxSignature: string | null;
  status: string;
  cancelReason: string | null;
  post: PostResponseDto | null;
  owner: UserProfileResponseDto | null;
  renter: UserProfileResponseDto | null;
  reviewsCount: number;
  events: RentEventResponseDto[];
  createdAt: string;
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
