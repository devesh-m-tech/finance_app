import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMode } from '../schemas/payment.schema';

export class GpsCoordinateDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsNumber()
  @IsOptional()
  accuracy?: number;
}

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  loanId: string;

  @IsNumber()
  @Min(100) // Minimum 1 Rupee (100 paise)
  amountPaise: number;

  @IsEnum(PaymentMode)
  paymentMode: PaymentMode;

  @ValidateNested()
  @Type(() => GpsCoordinateDto)
  @IsOptional()
  gpsLocation?: GpsCoordinateDto;

  @IsString()
  @IsOptional()
  notes?: string;
}
