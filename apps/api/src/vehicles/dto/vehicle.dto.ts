import { Transform, Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import {
  VehicleDocumentType,
  VehicleStatus,
  VehicleType,
} from "@prisma/client";
import { PaginationDto } from "../../common/validation";
const emptyNull = (v: unknown) => (v === "" ? null : v);
const trim = (v: unknown) => (typeof v === "string" ? v.trim() : v);
const nullable = (v: unknown) => (v === "" ? null : trim(v));
export const normalizePlate = (v: unknown) =>
  typeof v === "string" ? v.replace(/[^a-z0-9]/gi, "").toUpperCase() : v;
export const normalizeRenavam = (v: unknown) =>
  typeof v === "string" ? v.replace(/\D/g, "") : v;
const YEAR_MIN = 1900,
  YEAR_MAX = new Date().getUTCFullYear() + 2;
export class VehicleQueryDto extends PaginationDto {
  @IsOptional() @IsEnum(VehicleStatus) status?: VehicleStatus;
  @IsOptional() @IsEnum(VehicleType) type?: VehicleType;
  @IsOptional()
  @IsIn(["EXPIRED", "EXPIRING_SOON", "REGULAR"])
  documentStatus?: string;
  @IsOptional() @IsString() defaultDriverId?: string;
}
export class StartAddressDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.replace(/\D/g, "") : undefined,
  )
  @IsOptional()
  @Length(8, 8)
  postalCode?: string;
  @IsString() @MinLength(2) street!: string;
  @IsOptional() @IsString() number?: string;
  @IsOptional() @IsString() complement?: string;
  @IsOptional() @IsString() neighborhood?: string;
  @IsString() @MinLength(2) city!: string;
  @IsString() @Length(2, 2) state!: string;
}
export class CreateVehicleDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => StartAddressDto)
  startAddress?: StartAddressDto;
  @Transform(({ value }) => normalizePlate(value))
  @Matches(/^(?:[A-Z]{3}\d{4}|[A-Z]{3}\d[A-Z]\d{2})$/)
  plate!: string;
  @Transform(({ value }) => {
    const x = normalizeRenavam(value);
    return x === "" ? undefined : x;
  })
  @IsOptional()
  @Length(11, 11)
  renavam?: string;
  @Transform(({ value }) => trim(value))
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  brand!: string;
  @Transform(({ value }) => trim(value))
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  model!: string;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(YEAR_MIN)
  @Max(YEAR_MAX)
  manufactureYear?: number;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(YEAR_MIN)
  @Max(YEAR_MAX)
  modelYear?: number;
  @Transform(({ value }) => nullable(value))
  @IsOptional()
  @IsString()
  @MaxLength(40)
  color?: string | null;
  @Type(() => Number) @IsInt() @Min(1) @Max(100) passengerCapacity!: number;
  @IsEnum(VehicleType) type!: VehicleType;
  @IsOptional() @IsEnum(VehicleStatus) status: VehicleStatus =
    VehicleStatus.ACTIVE;
  @Transform(({ value }: { value: unknown }) => emptyNull(value))
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  currentMileage?: number | null;
  @Transform(({ value }: { value: unknown }) => emptyNull(value))
  @IsOptional()
  @IsString()
  defaultDriverId?: string | null;
  @Transform(({ value }) => nullable(value))
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string | null;
}
export class UpdateVehicleDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => StartAddressDto)
  startAddress?: StartAddressDto;
  @IsOptional()
  @Transform(({ value }) => normalizePlate(value))
  @Matches(/^(?:[A-Z]{3}\d{4}|[A-Z]{3}\d[A-Z]\d{2})$/)
  plate?: string;
  @Transform(({ value }) => {
    const x = normalizeRenavam(value);
    return x === "" ? null : x;
  })
  @IsOptional()
  @Length(11, 11)
  renavam?: string | null;
  @IsOptional()
  @Transform(({ value }) => trim(value))
  @IsString()
  @MinLength(2)
  brand?: string;
  @IsOptional()
  @Transform(({ value }) => trim(value))
  @IsString()
  @MinLength(1)
  model?: string;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(YEAR_MIN)
  @Max(YEAR_MAX)
  manufactureYear?: number | null;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(YEAR_MIN)
  @Max(YEAR_MAX)
  modelYear?: number | null;
  @Transform(({ value }) => nullable(value)) @IsOptional() @IsString() color?:
    string | null;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  passengerCapacity?: number;
  @IsOptional() @IsEnum(VehicleType) type?: VehicleType;
  @IsOptional() @IsEnum(VehicleStatus) status?: VehicleStatus;
  @Transform(({ value }: { value: unknown }) => emptyNull(value))
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  currentMileage?: number | null;
  @Transform(({ value }: { value: unknown }) => emptyNull(value))
  @IsOptional()
  @IsString()
  defaultDriverId?: string | null;
  @Transform(({ value }) => nullable(value))
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string | null;
}
export class CreateVehicleDocumentDto {
  @IsEnum(VehicleDocumentType) type!: VehicleDocumentType;
  @Transform(({ value }) => nullable(value))
  @IsOptional()
  @IsString()
  @MaxLength(100)
  identifier?: string | null;
  @IsOptional() @IsDateString({ strict: true }) issuedAt?: string | null;
  @IsOptional() @IsDateString({ strict: true }) expiresAt?: string | null;
  @Transform(({ value }) => nullable(value))
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string | null;
}
export class UpdateVehicleDocumentDto extends CreateVehicleDocumentDto {}
