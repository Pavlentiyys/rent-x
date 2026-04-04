import { CreateUserDto } from './create-user.dto';
declare const UpdateUserDto_base: import("@nestjs/mapped-types").MappedType<Partial<Omit<CreateUserDto, "walletAddress">>>;
export declare class UpdateUserDto extends UpdateUserDto_base {
}
export {};
