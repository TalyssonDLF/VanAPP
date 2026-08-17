import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto, StudentQueryDto, UpdateStudentDto } from './dto/student.dto';
export declare class StudentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private ensureGuardians;
    private conflict;
    create(dto: CreateStudentDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        document: string | null;
        birthDate: Date | null;
        status: import(".prisma/client").$Enums.StudentStatus;
        notes: string | null;
    }>;
    list(query: StudentQueryDto): Promise<{
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
    findOne(id: string): Promise<{
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
    update(id: string, dto: UpdateStudentDto): Promise<{
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
