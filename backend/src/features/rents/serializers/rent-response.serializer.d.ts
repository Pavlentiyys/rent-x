import { UserProfileResponseDto } from '../../users/serializers/user-response.serializer';
import { PostResponseDto } from '../../posts/serializers/post-response.serializer';
import { Rent } from '../entities/rent.entity';
export declare class RentEventResponseDto {
    id: number;
    type: string;
    payload: Record<string, unknown> | null;
    createdAt: string;
}
export declare class RentResponseDto {
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
export declare function serializeRent(rent: Rent): RentResponseDto;
export declare function serializeRentList(rents: Rent[]): RentResponseDto[];
