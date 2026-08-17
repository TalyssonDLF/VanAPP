import { CreateStudentDto, StudentQueryDto, UpdateStudentDto } from './dto/student.dto';
import { StudentsService } from './students.service';
export declare class StudentsController {
    private readonly service;
    constructor(service: StudentsService);
    list(q: StudentQueryDto): Promise<{
        data: {
            guardianCount: number;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            document: string | null;
            birthDate: Date | null;
            status: import(".prisma/client").$Enums.StudentStatus;
            notes: string | null;
        }[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    one(id: string): Promise<{
        guardians: {
            relationship: import(".prisma/client").$Enums.GuardianRelationship;
            email: string | null;
            name: string;
            id: string;
            phone: string;
        }[];
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        document: string | null;
        birthDate: Date | null;
        status: import(".prisma/client").$Enums.StudentStatus;
        notes: string | null;
    }>;
    create(d: CreateStudentDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        document: string | null;
        birthDate: Date | null;
        status: import(".prisma/client").$Enums.StudentStatus;
        notes: string | null;
    }>;
    update(id: string, d: UpdateStudentDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        document: string | null;
        birthDate: Date | null;
        status: import(".prisma/client").$Enums.StudentStatus;
        notes: string | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
