import { IsString, Length, Matches } from 'class-validator';

export class VerifySiwsSignatureDto {
  @IsString()
  @Matches(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)
  wallet: string;

  @IsString()
  @Length(32, 2000)
  message: string;

  @IsString()
  @Length(32, 256)
  signature: string;
}
