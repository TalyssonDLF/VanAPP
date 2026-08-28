import { Transform } from "class-transformer";
import {
  IsHexColor,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from "class-validator";
import {
  digits,
  emptyToUndefined,
  PaginationDto,
} from "../../common/validation";

export class SchoolDto {
  @IsString() @MinLength(2) @MaxLength(120) name!: string;
  @IsHexColor() mapColor!: string;
  @Transform(({ value }) => digits(emptyToUndefined(value)))
  @IsOptional()
  @Length(8, 8)
  postalCode?: string;
  @IsOptional() @IsString() @MaxLength(160) street?: string;
  @IsOptional() @IsString() @MaxLength(20) number?: string;
  @IsOptional() @IsString() @MaxLength(100) complement?: string;
  @IsOptional() @IsString() @MaxLength(100) neighborhood?: string;
  @IsOptional() @IsString() @MaxLength(100) city?: string;
  @IsOptional() @IsString() @Length(2, 2) state?: string;
}
export class SchoolQueryDto extends PaginationDto {}
export class UpdateSchoolDto extends SchoolDto {
  @IsOptional() name!: string;
  @IsOptional() mapColor!: string;
}
