import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { LoanType } from '../schemas/loan.schema';

export class VehicleCollateralDto {
  @IsEnum(['TWO_WHEELER', 'FOUR_WHEELER'])
  vehicleType: string;

  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @IsString()
  @IsOptional()
  chassisNumber?: string;

  @IsString()
  @IsOptional()
  engineNumber?: string;

  @IsString()
  @IsNotEmpty()
  make: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsNumber()
  year: number;

  @IsNumber()
  @Min(0)
  exShowroomPricePaise: number;

  @IsOptional()
  insuranceExpiryDate?: Date;

  @IsString()
  @IsOptional()
  rcBookUrl?: string;
}

export class MetalOrnamentDto {
  @IsString()
  @IsNotEmpty()
  itemName: string;

  @IsString()
  @IsNotEmpty()
  karatOrPurity: string;

  @IsNumber()
  @Min(0.01)
  grossWeightGrams: number;

  @IsNumber()
  @Min(0)
  stoneWeightGrams: number;

  @IsNumber()
  @Min(0.01)
  netWeightGrams: number;

  @IsNumber()
  @Min(1)
  ratePerGramPaise: number;

  @IsNumber()
  @Min(1)
  itemValuationPaise: number;
}

export class MetalCollateralDto {
  @IsEnum(['GOLD', 'SILVER'])
  metalType: string;

  @ValidateNested({ each: true })
  @Type(() => MetalOrnamentDto)
  ornaments: MetalOrnamentDto[];

  @IsNumber()
  @Min(0.01)
  totalGrossGrams: number;

  @IsNumber()
  @Min(0.01)
  totalNetGrams: number;

  @IsNumber()
  @Min(100)
  totalValuationPaise: number;

  @IsNumber()
  @Min(1)
  @Max(75) // Maximum 75% LTV as per statutory guidelines
  ltvPercent: number;

  @IsString()
  @IsNotEmpty()
  vaultPacketNumber: string;

  @IsString()
  @IsOptional()
  storageRackNumber?: string;

  @IsString()
  @IsNotEmpty()
  appraiserName: string;
}

export class PreviewLoanDto {
  @IsEnum(LoanType)
  loanType: LoanType;

  @IsNumber()
  @Min(100000) // Minimum 1000 rupees (100,000 paise)
  principalPaise: number;

  @IsNumber()
  @Min(0.1)
  @Max(100)
  interestRatePercent: number;

  @IsNumber()
  @Min(1)
  tenure: number;

  @IsEnum(['DAYS', 'WEEKS', 'MONTHS'])
  tenureUnit: 'DAYS' | 'WEEKS' | 'MONTHS';

  @IsEnum(['FLAT', 'REDUCING'])
  calculationType: 'FLAT' | 'REDUCING';

  @IsEnum(['DAILY', 'WEEKLY', 'MONTHLY'])
  repaymentFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
}

export class CreateLoanDto extends PreviewLoanDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsString()
  @IsOptional()
  assignedRouteId?: string;

  @IsString()
  @IsOptional()
  assignedTo?: string;

  @ValidateNested()
  @Type(() => VehicleCollateralDto)
  @IsOptional()
  vehicleCollateral?: VehicleCollateralDto;

  @ValidateNested()
  @Type(() => MetalCollateralDto)
  @IsOptional()
  metalCollateral?: MetalCollateralDto;
}

export class ApproveLoanDto {
  @IsString()
  @IsOptional()
  remarks?: string;
}
