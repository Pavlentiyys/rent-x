import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateRentDto } from './dto/create-rent.dto';
import { DisputeRentDto } from './dto/dispute-rent.dto';
import { RejectRentDto } from './dto/reject-rent.dto';
import { RentReasonDto } from './dto/rent-reason.dto';
import { RentsService } from './rents.service';
export declare class RentsController {
    private readonly rentsService;
    constructor(rentsService: RentsService);
    create(dto: CreateRentDto, currentUser: AuthenticatedUser): Promise<import("./serializers/rent-response.serializer").RentResponseDto>;
    findAll(currentUser: AuthenticatedUser): Promise<import("./serializers/rent-response.serializer").RentResponseDto[]>;
    findOne(id: number, currentUser: AuthenticatedUser): Promise<import("./serializers/rent-response.serializer").RentResponseDto>;
    approve(id: number, currentUser: AuthenticatedUser): Promise<import("./serializers/rent-response.serializer").RentResponseDto>;
    reject(id: number, dto: RejectRentDto, currentUser: AuthenticatedUser): Promise<import("./serializers/rent-response.serializer").RentResponseDto>;
    markPaid(id: number, currentUser: AuthenticatedUser): Promise<import("./serializers/rent-response.serializer").RentResponseDto>;
    handover(id: number, currentUser: AuthenticatedUser): Promise<import("./serializers/rent-response.serializer").RentResponseDto>;
    complete(id: number, currentUser: AuthenticatedUser): Promise<import("./serializers/rent-response.serializer").RentResponseDto>;
    cancel(id: number, dto: RentReasonDto, currentUser: AuthenticatedUser): Promise<import("./serializers/rent-response.serializer").RentResponseDto>;
    dispute(id: number, dto: DisputeRentDto, currentUser: AuthenticatedUser): Promise<import("./serializers/rent-response.serializer").RentResponseDto>;
    remove(id: number, currentUser: AuthenticatedUser): Promise<{
        id: number;
        deleted: boolean;
    }>;
}
