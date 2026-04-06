import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateRentDto } from './dto/create-rent.dto';
import { DisputeRentDto } from './dto/dispute-rent.dto';
import { RejectRentDto } from './dto/reject-rent.dto';
import { RentReasonDto } from './dto/rent-reason.dto';
import { RentsService } from './rents.service';
import { RentResponseDto } from './serializers/rent-response.serializer';
export declare class RentsController {
    private readonly rentsService;
    constructor(rentsService: RentsService);
    create(dto: CreateRentDto, currentUser: AuthenticatedUser): Promise<RentResponseDto>;
    findAll(currentUser: AuthenticatedUser): Promise<RentResponseDto[]>;
    findOne(id: number, currentUser: AuthenticatedUser): Promise<RentResponseDto>;
    approve(id: number, currentUser: AuthenticatedUser): Promise<RentResponseDto>;
    reject(id: number, dto: RejectRentDto, currentUser: AuthenticatedUser): Promise<RentResponseDto>;
    markPaid(id: number, currentUser: AuthenticatedUser): Promise<RentResponseDto>;
    handover(id: number, currentUser: AuthenticatedUser): Promise<RentResponseDto>;
    complete(id: number, currentUser: AuthenticatedUser): Promise<RentResponseDto>;
    cancel(id: number, dto: RentReasonDto, currentUser: AuthenticatedUser): Promise<RentResponseDto>;
    dispute(id: number, dto: DisputeRentDto, currentUser: AuthenticatedUser): Promise<RentResponseDto>;
    remove(id: number, currentUser: AuthenticatedUser): Promise<{
        id: number;
        deleted: boolean;
    }>;
}
