import { PrismaService } from '../prisma/prisma.service';
import { CreateGuardianDto, GuardianQueryDto, UpdateGuardianDto } from './dto/guardian.dto';
export declare class GuardiansService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private conflict;
    create(dto: CreateGuardianDto): Promise<{
        email: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        document: string | null;
    }>;
    list(query: GuardianQueryDto): Promise<{
        data: {
            studentCount: number;
            email: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string;
            document: string | null;
        }[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        students: {
            relationship: import(".prisma/client").$Enums.GuardianRelationship;
            name: string;
            id: string;
            status: import(".prisma/client").$Enums.StudentStatus;
        }[];
        email: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        document: string | null;
    }>;
    update(id: string, dto: UpdateGuardianDto): Promise<{
        email: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        document: string | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
