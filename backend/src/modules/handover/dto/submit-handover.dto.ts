import { IsNumber, IsOptional, IsString, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class DenominationsCountDto {
  @IsNumber()
  @Min(0)
  note2000: number;

  @IsNumber()
  @Min(0)
  note500: number;

  @IsNumber()
  @Min(0)
  note200: number;

  @IsNumber()
  @Min(0)
  note100: number;

  @IsNumber()
  @Min(0)
  note50: number;

  @IsNumber()
  @Min(0)
  note20: number;

  @IsNumber()
  @Min(0)
  note10: number;

  @IsNumber()
  @Min(0)
  coins: number;
}

export class SubmitHandoverDto {
  @ValidateNested()
  @Type(() => DenominationsCountDto)
  denominations: DenominationsCountDto;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class AcceptHandoverDto {
  @IsString()
  @IsOptional()
  remarks?: string;
}
