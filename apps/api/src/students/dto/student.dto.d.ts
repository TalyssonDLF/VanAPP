import { GuardianRelationship, StudentStatus } from '@prisma/client';
import { PaginationDto } from '../../common/validation';
export declare class StudentGuardianDto {
    guardianId: string;
    relationship: GuardianRelationship;
}
export declare class StudentQueryDto extends PaginationDto {
    status?: StudentStatus;
}
export declare class CreateStudentDto {
    name: string;
    birthDate?: string;
    document?: string;
    status: StudentStatus;
    notes?: string;
    guardians: StudentGuardianDto[];
}
export declare class UpdateStudentDto {
    name?: string;
    birthDate?: string;
    document?: string;
    status?: StudentStatus;
    notes?: string;
    guardians?: StudentGuardianDto[];
}
