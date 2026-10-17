import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { VisitOutcome } from '../schemas/collection-visit.schema';
import { GpsCoordinateDto } from '../../payments/dto/create-payment.dto';

export class CreateVisitDto {
  @IsString()
  @IsNotEmpty()
  loanId: string;

  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsEnum(VisitOutcome)
  outcome: VisitOutcome;

  @IsOptional()
  ptpDate?: Date;

  @IsNumber()
  @IsOptional()
  @Min(0)
  ptpAmountPaise?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  collectedAmountPaise?: number;

  @ValidateNested()
  @Type(() => GpsCoordinateDto)
  @IsNotEmpty()
  gpsLocation: GpsCoordinateDto;

  @IsString()
  @IsOptional()
  notes?: string;
}
