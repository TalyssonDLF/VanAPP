import { Transform } from 'class-transformer';
import { IsDateString, IsEmail, IsEnum, IsIn, IsOptional, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator';
import { DriverStatus } from '@prisma/client';
import { digits, emptyToUndefined, IsCpf, PaginationDto } from '../../common/validation';
import { LICENSE_CATEGORIES } from '../driver.constants';

const trim = (value: unknown) => typeof value === 'string' ? value.trim() : value;
const optional = (value: unknown) => emptyToUndefined(trim(value));

export class DriverQueryDto extends PaginationDto {
  @IsOptional() @IsEnum(DriverStatus) status?: DriverStatus;
  @IsOptional() @IsIn(['VALID', 'EXPIRING_SOON', 'EXPIRED']) licenseStatus?: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';
  @IsOptional() @IsIn(LICENSE_CATEGORIES) licenseCategory?: string;
}
export class CreateDriverDto {
  @Transform(({ value }: { value: unknown }) => trim(value)) @IsString() @MinLength(2) @MaxLength(120) name!: string;
  @Transform(({ value }: { value: unknown }) => digits(value)) @IsString() @Length(11, 11) @IsCpf() document!: string;
  @Transform(({ value }: { value: unknown }) => digits(value)) @IsString() @Matches(/^\d{10,11}$/) phone!: string;
  @Transform(({ value }: { value: unknown }) => { const normalized = optional(value); return typeof normalized === 'string' ? normalized.toLowerCase() : normalized; }) @IsOptional() @IsEmail() @MaxLength(254) email?: string;
  @Transform(({ value }: { value: unknown }) => optional(value)) @IsOptional() @IsDateString({ strict: true }) birthDate?: string;
  @Transform(({ value }: { value: unknown }) => trim(value)) @IsString() @Matches(/^[A-Za-z0-9]{5,20}$/) licenseNumber!: string;
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().toUpperCase() : value) @IsIn(LICENSE_CATEGORIES) licenseCategory!: string;
  @IsDateString({ strict: true }) licenseExpiresAt!: string;
  @IsOptional() @IsEnum(DriverStatus) status: DriverStatus = DriverStatus.ACTIVE;
  @Transform(({ value }: { value: unknown }) => optional(value)) @IsOptional() @IsString() @MaxLength(2000) notes?: string;
}
export class UpdateDriverDto {
  @IsOptional() @Transform(({ value }: { value: unknown }) => trim(value)) @IsString() @MinLength(2) @MaxLength(120) name?: string;
  @IsOptional() @Transform(({ value }: { value: unknown }) => digits(value)) @IsString() @Length(11, 11) @IsCpf() document?: string;
  @IsOptional() @Transform(({ value }: { value: unknown }) => digits(value)) @IsString() @Matches(/^\d{10,11}$/) phone?: string;
  @Transform(({ value }: { value: unknown }) => { const normalized = optional(value); return typeof normalized === 'string' ? normalized.toLowerCase() : normalized; }) @IsOptional() @IsEmail() @MaxLength(254) email?: string;
  @Transform(({ value }: { value: unknown }) => optional(value)) @IsOptional() @IsDateString({ strict: true }) birthDate?: string;
  @IsOptional() @Transform(({ value }: { value: unknown }) => trim(value)) @IsString() @Matches(/^[A-Za-z0-9]{5,20}$/) licenseNumber?: string;
  @IsOptional() @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().toUpperCase() : value) @IsIn(LICENSE_CATEGORIES) licenseCategory?: string;
  @IsOptional() @IsDateString({ strict: true }) licenseExpiresAt?: string;
  @IsOptional() @IsEnum(DriverStatus) status?: DriverStatus;
  @Transform(({ value }: { value: unknown }) => optional(value)) @IsOptional() @IsString() @MaxLength(2000) notes?: string;
}
