import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import {
  FinancialStatus,
  FinancialTransactionType,
  PaymentMethod,
} from "@prisma/client";

export class ListTransactionsDto {
  @IsOptional()
  @IsEnum(FinancialTransactionType)
  type?: FinancialTransactionType;
  @IsOptional() @IsEnum(FinancialStatus) status?: FinancialStatus;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
  @IsOptional() @IsString() studentId?: string;
  @IsOptional() @IsString() vehicleId?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize = 20;
}

export class CreateTransactionDto {
  @IsEnum(FinancialTransactionType) type!: FinancialTransactionType;
  @IsString() @MaxLength(160) description!: string;
  @IsInt() @Min(1) amountCents!: number;
  @IsDateString() dueDate!: string;
  @IsDateString() competence!: string;
  @IsOptional() @IsEnum(PaymentMethod) paymentMethod?: PaymentMethod;
  @IsOptional() @IsString() @MaxLength(1000) notes?: string;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsString() studentId?: string;
  @IsOptional() @IsString() guardianId?: string;
  @IsOptional() @IsString() vehicleId?: string;
  @IsOptional() @IsInt() @Min(1) @Max(120) installmentCount?: number;
}

export class UpdateTransactionDto {
  @IsOptional() @IsString() @MaxLength(160) description?: string;
  @IsOptional() @IsInt() @Min(1) amountCents?: number;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() @IsDateString() competence?: string;
  @IsOptional() @IsEnum(PaymentMethod) paymentMethod?: PaymentMethod;
  @IsOptional() @IsString() @MaxLength(1000) notes?: string;
  @IsOptional() @IsString() categoryId?: string;
}

export class PaymentDto {
  @IsInt() @Min(1) amountCents!: number;
  @IsEnum(PaymentMethod) method!: PaymentMethod;
  @IsDateString() paidAt!: string;
}

export class CancelDto {
  @IsString() @MaxLength(500) reason!: string;
}

export class BillingDto {
  @IsString() studentId!: string;
  @IsOptional() @IsString() guardianId?: string;
  @IsInt() @Min(1) monthlyAmountCents!: number;
  @IsOptional() @IsInt() @Min(0) discountCents = 0;
  @IsInt() @Min(1) @Max(31) dueDay!: number;
  @IsOptional() @IsEnum(PaymentMethod) preferredMethod?: PaymentMethod;
  @IsDateString() startsOn!: string;
  @IsOptional() @IsDateString() endsOn?: string;
  @IsOptional() @IsInt() @Min(1) @Max(36) months = 12;
}

export class FuelDto {
  @IsString() vehicleId!: string;
  @IsDateString() fueledOn!: string;
  @IsOptional() @IsString() @MaxLength(120) station?: string;
  @IsString() @MaxLength(40) fuelType!: string;
  @IsNumber({ maxDecimalPlaces: 3 }) @Min(0.001) liters!: number;
  @IsInt() @Min(1) pricePerLiterCents!: number;
  @IsInt() @Min(0) mileage!: number;
  @IsOptional() @IsBoolean() fullTank = false;
  @IsOptional() @IsString() @MaxLength(1000) notes?: string;
}
