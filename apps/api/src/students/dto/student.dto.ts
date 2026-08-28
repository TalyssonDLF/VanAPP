import { Transform, Type } from "class-transformer";
import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";
import { GuardianRelationship, StudentStatus } from "@prisma/client";
import {
  digits,
  emptyToUndefined,
  IsCpf,
  PaginationDto,
} from "../../common/validation";

export class StudentGuardianDto {
  @IsString() @MinLength(1) guardianId!: string;
  @IsEnum(GuardianRelationship) relationship!: GuardianRelationship;
}
export class StudentAddressDto {
  @IsString() @MinLength(2) @MaxLength(160) street!: string;
  @IsOptional() @IsString() @MaxLength(20) number?: string;
  @IsOptional() @IsString() @MaxLength(100) complement?: string;
  @IsOptional() @IsString() @MaxLength(100) neighborhood?: string;
  @IsString() @MinLength(2) @MaxLength(100) city!: string;
  @IsString() @Length(2, 2) state!: string;
  @Transform(({ value }) => digits(emptyToUndefined(value)))
  @IsOptional()
  @IsString()
  @Length(8, 8)
  postalCode?: string;
}
export class StudentQueryDto extends PaginationDto {
  @IsOptional() @IsEnum(StudentStatus) status?: StudentStatus;
}
export class CreateStudentDto {
  @IsOptional() @IsString() schoolId?: string;
  @IsString() @MinLength(2) @MaxLength(120) name!: string;
  @Transform(({ value }) => emptyToUndefined(value))
  @IsOptional()
  @IsDateString({ strict: true })
  birthDate?: string;
  @Transform(({ value }) => digits(emptyToUndefined(value)))
  @IsOptional()
  @IsString()
  @Length(11, 11)
  @IsCpf()
  document?: string;
  @IsOptional() @IsEnum(StudentStatus) status: StudentStatus =
    StudentStatus.ACTIVE;
  @Transform(({ value }) => emptyToUndefined(value))
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
  @IsOptional()
  @IsArray()
  @ArrayUnique((item: StudentGuardianDto) => item.guardianId, {
    message: "responsáveis não podem ser duplicados",
  })
  @ValidateNested({ each: true })
  @Type(() => StudentGuardianDto)
  guardians: StudentGuardianDto[] = [];
  @IsOptional()
  @ValidateNested()
  @Type(() => StudentAddressDto)
  address?: StudentAddressDto;
}
export class UpdateStudentDto {
  @IsOptional() @IsString() schoolId?: string;
  @IsOptional() @IsString() @MinLength(2) @MaxLength(120) name?: string;
  @Transform(({ value }) => emptyToUndefined(value))
  @IsOptional()
  @IsDateString({ strict: true })
  birthDate?: string;
  @Transform(({ value }) => digits(emptyToUndefined(value)))
  @IsOptional()
  @IsString()
  @Length(11, 11)
  @IsCpf()
  document?: string;
  @IsOptional() @IsEnum(StudentStatus) status?: StudentStatus;
  @Transform(({ value }) => emptyToUndefined(value))
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
  @IsOptional()
  @IsArray()
  @ArrayUnique((item: StudentGuardianDto) => item.guardianId, {
    message: "responsáveis não podem ser duplicados",
  })
  @ValidateNested({ each: true })
  @Type(() => StudentGuardianDto)
  guardians?: StudentGuardianDto[];
  @IsOptional()
  @ValidateNested()
  @Type(() => StudentAddressDto)
  address?: StudentAddressDto;
}
