import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator';
import { digits, emptyToUndefined, IsCpf, PaginationDto } from '../../common/validation';

export class GuardianQueryDto extends PaginationDto {}

export class CreateGuardianDto {
  @IsString() @MinLength(2) @MaxLength(120) name!: string;
  @Transform(({ value }) => digits(value)) @IsString() @Matches(/^\d{10,11}$/, { message: 'phone deve conter 10 ou 11 dígitos' }) phone!: string;
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() || undefined : emptyToUndefined(value)) @IsOptional() @IsEmail() @MaxLength(160) email?: string;
  @Transform(({ value }) => digits(emptyToUndefined(value))) @IsOptional() @IsString() @Length(11, 11) @IsCpf() document?: string;
}

export class UpdateGuardianDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(120) name?: string;
  @Transform(({ value }) => digits(value)) @IsOptional() @IsString() @Matches(/^\d{10,11}$/) phone?: string;
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() || undefined : emptyToUndefined(value)) @IsOptional() @IsEmail() @MaxLength(160) email?: string;
  @Transform(({ value }) => digits(emptyToUndefined(value))) @IsOptional() @IsString() @Length(11, 11) @IsCpf() document?: string;
}
