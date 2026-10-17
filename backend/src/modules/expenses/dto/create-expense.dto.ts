import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  category: string;

  @IsNumber()
  @Min(100) // Minimum 1 Rupee (100 paise)
  amountPaise: number;

  @IsEnum(['CASH', 'BANK_TRANSFER', 'UPI'])
  paymentMode: string;

  @IsOptional()
  expenseDate?: Date;

  @IsString()
  @IsOptional()
  receiptUrl?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
