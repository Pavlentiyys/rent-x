import { RentStatus } from '../entities/rent.entity';
export declare class UpdateRentStatusDto {
    status: RentStatus;
    cancelReason?: string;
    paymentTxSignature?: string;
    depositTxSignature?: string;
    returnTxSignature?: string;
}
