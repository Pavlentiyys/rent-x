import { Rent } from './rent.entity';
export declare class RentEvent {
    id: number;
    rentId: number;
    type: string;
    payload: Record<string, unknown> | null;
    rent: Rent;
    createdAt: Date;
}
