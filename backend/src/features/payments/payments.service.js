"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const web3_js_1 = require("@solana/web3.js");
const typeorm_2 = require("typeorm");
const rents_service_1 = require("../rents/rents.service");
const rent_event_entity_1 = require("../rents/entities/rent-event.entity");
const rent_entity_1 = require("../rents/entities/rent.entity");
let PaymentsService = class PaymentsService {
    rentsService;
    rentsRepository;
    rentEventsRepository;
    connection;
    constructor(configService, rentsService, rentsRepository, rentEventsRepository) {
        this.rentsService = rentsService;
        this.rentsRepository = rentsRepository;
        this.rentEventsRepository = rentEventsRepository;
        this.connection = new web3_js_1.Connection(configService.get('SOLANA_RPC_URL', 'https://api.devnet.solana.com'), configService.get('SOLANA_COMMITMENT', 'confirmed'));
    }
    async verifyRentPayment(rentId, signature, actorUserId, actorWallet) {
        const rent = await this.rentsService.findOne(rentId, actorUserId);
        if (rent.renterId !== actorUserId) {
            throw new common_1.ConflictException('Only the renter can attach rent payment transactions');
        }
        if (![rent_entity_1.RentStatus.Approved, rent_entity_1.RentStatus.Paid].includes(rent.status)) {
            throw new common_1.ConflictException('Rent payment can only be attached to approved or paid rents');
        }
        return this.attachVerifiedTransaction(rent, 'paymentTxSignature', signature, actorUserId, {
            actorWallet,
            expectedMint: rent.currencyMint,
            minAmount: Number(rent.rentAmount),
        }, 'payment.rent_verified');
    }
    async verifyDepositPayment(rentId, signature, actorUserId, actorWallet) {
        const rent = await this.rentsService.findOne(rentId, actorUserId);
        if (rent.renterId !== actorUserId) {
            throw new common_1.ConflictException('Only the renter can attach deposit payment transactions');
        }
        if (![rent_entity_1.RentStatus.Approved, rent_entity_1.RentStatus.Paid].includes(rent.status)) {
            throw new common_1.ConflictException('Deposit payment can only be attached to approved or paid rents');
        }
        if (Number(rent.depositAmount) <= 0) {
            throw new common_1.ConflictException('This rent does not require a deposit payment');
        }
        return this.attachVerifiedTransaction(rent, 'depositTxSignature', signature, actorUserId, {
            actorWallet,
            expectedMint: rent.currencyMint,
            minAmount: Number(rent.depositAmount),
        }, 'payment.deposit_verified');
    }
    async verifyReturnPayment(rentId, signature, actorUserId, actorWallet) {
        const rent = await this.rentsService.findOne(rentId, actorUserId);
        if (rent.ownerId !== actorUserId) {
            throw new common_1.ConflictException('Only the owner can attach return payment transactions');
        }
        if (![rent_entity_1.RentStatus.Active, rent_entity_1.RentStatus.Disputed, rent_entity_1.RentStatus.Completed].includes(rent.status)) {
            throw new common_1.ConflictException('Return payment can only be attached after the rent becomes active');
        }
        if (Number(rent.depositAmount) <= 0) {
            throw new common_1.ConflictException('This rent does not require a return payment');
        }
        return this.attachVerifiedTransaction(rent, 'returnTxSignature', signature, actorUserId, {
            actorWallet,
            expectedMint: rent.currencyMint,
            minAmount: 0.000001,
            maxAmount: Number(rent.depositAmount),
        }, 'payment.return_verified');
    }
    async inspectTransaction(signature, actorWallet) {
        const transaction = await this.fetchSuccessfulTransaction(signature);
        const signerWallets = this.extractSignerWallets(transaction);
        if (!signerWallets.includes(actorWallet)) {
            throw new common_1.BadRequestException('Authenticated wallet is not a signer of this transaction');
        }
        return this.toVerificationResponse(signature, transaction);
    }
    async attachVerifiedTransaction(rent, field, signature, actorUserId, requirement, eventType) {
        if (rent[field]) {
            throw new common_1.ConflictException(`Transaction for ${field} is already attached`);
        }
        await this.assertSignatureUnused(signature);
        const transaction = await this.fetchSuccessfulTransaction(signature);
        const signerWallets = this.extractSignerWallets(transaction);
        if (!signerWallets.includes(requirement.actorWallet)) {
            throw new common_1.BadRequestException('Authenticated wallet is not a signer of this transaction');
        }
        const matchedTransfer = this.findMatchingTransfer(transaction, requirement);
        if (!matchedTransfer) {
            throw new common_1.BadRequestException('Transaction does not contain the expected token transfer for this rent');
        }
        rent[field] = signature;
        await this.rentsRepository.save(rent);
        await this.rentEventsRepository.save(this.rentEventsRepository.create({
            rentId: rent.id,
            type: eventType,
            payload: {
                actorUserId,
                signature,
                slot: transaction.slot,
                blockTime: transaction.blockTime,
                signerWallets,
                field,
                matchedTransfer,
            },
        }));
        return {
            rent: await this.rentsService.findOne(rent.id, actorUserId),
            verification: this.toVerificationResponse(signature, transaction),
        };
    }
    async fetchSuccessfulTransaction(signature) {
        const transaction = await this.connection.getParsedTransaction(signature, {
            maxSupportedTransactionVersion: 0,
            commitment: 'confirmed',
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found on configured Solana RPC');
        }
        if (transaction.meta?.err) {
            throw new common_1.ConflictException('Transaction failed on chain');
        }
        return transaction;
    }
    extractSignerWallets(transaction) {
        return transaction.transaction.message.accountKeys
            .filter((account) => account.signer)
            .map((account) => account.pubkey.toBase58());
    }
    async assertSignatureUnused(signature) {
        const existingRent = await this.rentsRepository.findOne({
            where: [
                { paymentTxSignature: signature },
                { depositTxSignature: signature },
                { returnTxSignature: signature },
            ],
        });
        if (existingRent) {
            throw new common_1.ConflictException('Transaction signature is already attached to another rent');
        }
    }
    toVerificationResponse(signature, transaction) {
        return {
            signature,
            slot: transaction.slot,
            blockTime: transaction.blockTime,
            signerWallets: this.extractSignerWallets(transaction),
            accountKeys: transaction.transaction.message.accountKeys.map((account) => ({
                wallet: account.pubkey.toBase58(),
                signer: account.signer,
                writable: account.writable,
            })),
        };
    }
    findMatchingTransfer(transaction, requirement) {
        const transfers = this.extractTransfers(transaction);
        return transfers.find((transfer) => {
            if (transfer.mint !== requirement.expectedMint) {
                return false;
            }
            if (transfer.amount < requirement.minAmount) {
                return false;
            }
            if (requirement.maxAmount !== undefined &&
                transfer.amount > requirement.maxAmount) {
                return false;
            }
            if (transfer.authority && transfer.authority !== requirement.actorWallet) {
                return false;
            }
            return true;
        });
    }
    extractTransfers(transaction) {
        return transaction.transaction.message.instructions.flatMap((instruction) => {
            if (!('parsed' in instruction) || !instruction.parsed) {
                return [];
            }
            if (!['spl-token', 'spl-token-2022'].includes(instruction.program)) {
                return [];
            }
            const parsed = instruction.parsed;
            if (!['transfer', 'transferChecked'].includes(parsed.type ?? '')) {
                return [];
            }
            const info = parsed.info ?? {};
            const amount = this.extractTransferAmount(info);
            if (amount === null) {
                return [];
            }
            return [
                {
                    program: instruction.program,
                    mint: typeof info.mint === 'string' ? info.mint : null,
                    amount,
                    authority: this.extractAuthority(info),
                    source: typeof info.source === 'string' ? info.source : null,
                    destination: typeof info.destination === 'string' ? info.destination : null,
                },
            ];
        });
    }
    extractTransferAmount(info) {
        const tokenAmount = info.tokenAmount;
        if (typeof tokenAmount?.uiAmountString === 'string') {
            return Number(tokenAmount.uiAmountString);
        }
        if (typeof tokenAmount?.uiAmount === 'number') {
            return tokenAmount.uiAmount;
        }
        if (typeof info.amount === 'string' || typeof info.amount === 'number') {
            return Number(info.amount);
        }
        return null;
    }
    extractAuthority(info) {
        const authorityFields = ['authority', 'owner', 'sourceOwner', 'multisigAuthority'];
        for (const field of authorityFields) {
            const value = info[field];
            if (typeof value === 'string') {
                return value;
            }
        }
        return null;
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(rent_entity_1.Rent)),
    __param(3, (0, typeorm_1.InjectRepository)(rent_event_entity_1.RentEvent)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        rents_service_1.RentsService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map