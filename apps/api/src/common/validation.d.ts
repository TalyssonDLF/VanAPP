import { ValidationOptions } from 'class-validator';
export declare const digits: (value: unknown) => unknown;
export declare const emptyToUndefined: (value: unknown) => {} | undefined;
export declare function isCpf(value: string): boolean;
export declare function IsCpf(options?: ValidationOptions): (object: object, propertyName: string) => void;
export declare class PaginationDto {
    search?: string;
    page: number;
    pageSize: number;
}
