import { IsString, IsNotEmpty, IsEnum, IsOptional, ValidateNested, IsObject, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  line1: string;

  @IsString()
  @IsOptional()
  line2?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'Pincode must be 6 digits' })
  pincode: string;

  @IsString()
  @IsOptional()
  landmark?: string;
}

export class GuarantorDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{10}$/, { message: 'Guarantor mobile must be 10 digits' })
  mobile: string;

  @IsString()
  @IsNotEmpty()
  relationship: string;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsNotEmpty()
  address: AddressDto;

  @IsString()
  @IsOptional()
  aadhaarNumber?: string;
}

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{10}$/, { message: 'Mobile must be 10 digits' })
  mobile: string;

  @IsString()
  @IsNotEmpty()
  dob: string;

  @IsEnum(['MALE', 'FEMALE', 'OTHER'])
  gender: string;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsNotEmpty()
  address: AddressDto;

  @IsString()
  @IsOptional()
  @Matches(/^\d{12}$/, { message: 'Aadhaar must be 12 digits' })
  aadhaarNumber?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: 'Invalid PAN format' })
  panNumber?: string;

  @IsString()
  @IsOptional()
  assignedRouteId?: string;

  @IsString()
  @IsOptional()
  assignedTo?: string;

  @ValidateNested()
  @Type(() => GuarantorDto)
  @IsOptional()
  guarantor?: GuarantorDto;

  @IsObject()
  @IsOptional()
  customFields?: Record<string, any>;
}

export class VerifyCustomerDto {
  @IsEnum(['VERIFIED', 'REJECTED'])
  action: 'VERIFIED' | 'REJECTED';

  @IsString()
  @IsOptional()
  reason?: string;
}

export class AddDocumentDto {
  @IsString()
  @IsNotEmpty()
  docType: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  fileKey: string;

  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @IsString()
  @IsNotEmpty()
  mimeType: string;
}
