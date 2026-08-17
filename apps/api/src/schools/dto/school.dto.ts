import { Transform, TransformFnParams } from 'class-transformer';
import { IsEnum, IsIn, IsOptional, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator';
import { SchoolStatus } from '@prisma/client';
import { digits, emptyToUndefined, PaginationDto } from '../../common/validation';

const states = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
const optionalText = () => Transform(({ value }) => typeof value === 'string' ? emptyToUndefined(value.trim()) : emptyToUndefined(value));
const normalizeName = ({ value }: TransformFnParams): unknown => typeof value === 'string' ? value.trim() : value as unknown;
const normalizeDigits = ({ value }: TransformFnParams): unknown => digits(emptyToUndefined(value as unknown));

export class SchoolQueryDto extends PaginationDto {
  @IsOptional() @IsEnum(SchoolStatus) status?: SchoolStatus;
}

export class CreateSchoolDto {
  @Transform(normalizeName) @IsString() @MinLength(2) @MaxLength(150) name!: string;
  @Transform(normalizeDigits) @IsOptional() @IsString() @Matches(/^\d{10,11}$/, { message: 'telefone deve ter 10 ou 11 dígitos' }) phone?: string;
  @Transform(normalizeDigits) @IsOptional() @IsString() @Length(8, 8) postalCode?: string;
  @optionalText() @IsOptional() @IsString() @MaxLength(150) street?: string;
  @optionalText() @IsOptional() @IsString() @MaxLength(20) number?: string;
  @optionalText() @IsOptional() @IsString() @MaxLength(100) complement?: string;
  @optionalText() @IsOptional() @IsString() @MaxLength(100) neighborhood?: string;
  @optionalText() @IsOptional() @IsString() @MaxLength(100) city?: string;
  @Transform(({ value }) => typeof value === 'string' ? emptyToUndefined(value.trim().toUpperCase()) : emptyToUndefined(value)) @IsOptional() @IsString() @Length(2, 2) @IsIn(states) state?: string;
  @Transform(({ value }) => emptyToUndefined(value)) @IsOptional() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) entryTime?: string;
  @Transform(({ value }) => emptyToUndefined(value)) @IsOptional() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) exitTime?: string;
  @IsOptional() @IsEnum(SchoolStatus) status: SchoolStatus = SchoolStatus.ACTIVE;
  @optionalText() @IsOptional() @IsString() @MaxLength(2000) notes?: string | null;
}

export class UpdateSchoolDto {
  @IsOptional() @Transform(normalizeName) @IsString() @MinLength(2) @MaxLength(150) name?: string;
  @Transform(normalizeDigits) @IsOptional() @IsString() @Matches(/^\d{10,11}$/) phone?: string | null;
  @Transform(normalizeDigits) @IsOptional() @IsString() @Length(8, 8) postalCode?: string | null;
  @optionalText() @IsOptional() @IsString() @MaxLength(150) street?: string | null;
  @optionalText() @IsOptional() @IsString() @MaxLength(20) number?: string | null;
  @optionalText() @IsOptional() @IsString() @MaxLength(100) complement?: string | null;
  @optionalText() @IsOptional() @IsString() @MaxLength(100) neighborhood?: string | null;
  @optionalText() @IsOptional() @IsString() @MaxLength(100) city?: string | null;
  @Transform(({ value }) => typeof value === 'string' ? emptyToUndefined(value.trim().toUpperCase()) : emptyToUndefined(value)) @IsOptional() @IsString() @Length(2, 2) @IsIn(states) state?: string | null;
  @Transform(({ value }) => emptyToUndefined(value)) @IsOptional() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) entryTime?: string | null;
  @Transform(({ value }) => emptyToUndefined(value)) @IsOptional() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) exitTime?: string | null;
  @IsOptional() @IsEnum(SchoolStatus) status?: SchoolStatus;
  @optionalText() @IsOptional() @IsString() @MaxLength(2000) notes?: string | null;
}
