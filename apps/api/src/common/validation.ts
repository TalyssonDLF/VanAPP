import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min, registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export const digits = (value: unknown) => typeof value === 'string' ? value.replace(/\D/g, '') : value;
export const emptyToUndefined = (value: unknown) => value === '' || value === null ? undefined : value;

export function isCpf(value: string) {
  const cpf = value.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const digit = (length: number) => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) sum += Number(cpf[index]) * (length + 1 - index);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };
  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
}

export function IsCpf(options?: ValidationOptions) {
  return (object: object, propertyName: string) => registerDecorator({
    name: 'isCpf', target: object.constructor, propertyName, options,
    validator: { validate: (value: unknown) => typeof value === 'string' && isCpf(value), defaultMessage: (args: ValidationArguments) => `${args.property} deve ser um CPF válido` },
  });
}

export class PaginationDto {
  @IsOptional() search?: string;
  @Transform(({ value }) => Number(value)) @IsInt() @Min(1) page = 1;
  @Transform(({ value }) => Number(value)) @IsInt() @Min(1) @Max(100) pageSize = 20;
}
