import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { RentsService } from '../rents/rents.service';
import { RentEvent } from '../rents/entities/rent-event.entity';
import { Rent } from '../rents/entities/rent.entity';
export declare class PaymentsService {
    private readonly rentsService;
    private readonly rentsRepository;
    private readonly rentEventsRepository;
    private readonly connection;
    constructor(configService: ConfigService, rentsService: RentsService, rentsRepository: Repository<Rent>, rentEventsRepository: Repository<RentEvent>);
    verifyRentPayment(rentId: number, signature: string, actorUserId: number, actorWallet: string): Promise<{
        rent: Rent;
        verification: {
            signature: string;
            slot: number;
            blockTime: number | null | undefined;
            signerWallets: string[];
            accountKeys: {
                wallet: string;
                signer: boolean;
                writable: boolean;
            }[];
        };
    }>;
    verifyDepositPayment(rentId: number, signature: string, actorUserId: number, actorWallet: string): Promise<{
        rent: Rent;
        verification: {
            signature: string;
            slot: number;
            blockTime: number | null | undefined;
            signerWallets: string[];
            accountKeys: {
                wallet: string;
                signer: boolean;
                writable: boolean;
            }[];
        };
    }>;
    verifyReturnPayment(rentId: number, signature: string, actorUserId: number, actorWallet: string): Promise<{
        rent: Rent;
        verification: {
            signature: string;
            slot: number;
            blockTime: number | null | undefined;
            signerWallets: string[];
            accountKeys: {
                wallet: string;
                signer: boolean;
                writable: boolean;
            }[];
        };
    }>;
    inspectTransaction(signature: string, actorWallet: string): Promise<{
        signature: string;
        slot: number;
        blockTime: number | null | undefined;
        signerWallets: string[];
        accountKeys: {
            wallet: string;
            signer: boolean;
            writable: boolean;
        }[];
    }>;
    private attachVerifiedTransaction;
    private fetchSuccessfulTransaction;
    private extractSignerWallets;
    private assertSignatureUnused;
    private toVerificationResponse;
    private findMatchingTransfer;
    private extractTransfers;
    private extractTransferAmount;
    private extractAuthority;
}
