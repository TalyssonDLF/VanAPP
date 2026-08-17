import { PaginationDto } from '../../common/validation';
export declare class GuardianQueryDto extends PaginationDto {
}
export declare class CreateGuardianDto {
    name: string;
    phone: string;
    email?: string;
    document?: string;
}
export declare class UpdateGuardianDto {
    name?: string;
    phone?: string;
    email?: string;
    document?: string;
}
