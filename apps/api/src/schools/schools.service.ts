import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { addressKey, GeocodingService } from "../geocoding/geocoding.service";
import { SchoolDto, SchoolQueryDto, UpdateSchoolDto } from "./dto/school.dto";

@Injectable()
export class SchoolsService {
  constructor(
    private prisma: PrismaService,
    private geocoding: GeocodingService,
  ) {}
  private data(dto: SchoolDto | UpdateSchoolDto) {
    return {
      ...dto,
      name: dto.name?.trim(),
      state: dto.state?.trim().toUpperCase(),
      street: dto.street?.trim(),
      city: dto.city?.trim(),
      latitude: undefined,
      longitude: undefined,
    };
  }
  private async coordinates(dto: SchoolDto | UpdateSchoolDto) {
    if (!dto.street || !dto.city || !dto.state)
      return { latitude: null, longitude: null };
    try {
      return (
        (await this.geocoding.geocode(dto)) ?? {
          latitude: null,
          longitude: null,
        }
      );
    } catch {
      return { latitude: null, longitude: null };
    }
  }
  async create(dto: SchoolDto) {
    return this.prisma.school.create({
      data: {
        ...this.data(dto),
        ...(await this.coordinates(dto)),
      },
    });
  }
  async list(q: SchoolQueryDto) {
    const where = q.search
      ? { name: { contains: q.search, mode: "insensitive" as const } }
      : {};
    const [data, total] = await this.prisma.$transaction([
      this.prisma.school.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
        include: { _count: { select: { students: true } } },
      }),
      this.prisma.school.count({ where }),
    ]);
    return {
      data: data.map(({ _count, ...school }) => ({
        ...school,
        studentCount: _count.students,
      })),
      pagination: {
        page: q.page,
        pageSize: q.pageSize,
        total,
        totalPages: Math.ceil(total / q.pageSize),
      },
    };
  }
  async one(id: string) {
    const school = await this.prisma.school.findUnique({
      where: { id },
      include: { _count: { select: { students: true } } },
    });
    if (!school) throw new NotFoundException("Escola não encontrada.");
    return {
      ...school,
      studentCount: school._count.students,
      _count: undefined,
    };
  }
  async update(id: string, dto: UpdateSchoolDto) {
    const old = await this.one(id);
    const changed = addressKey(old) !== addressKey(dto);
    return this.prisma.school.update({
      where: { id },
      data: {
        ...this.data(dto),
        ...(changed ? await this.coordinates(dto) : {}),
      },
    });
  }
  async remove(id: string) {
    await this.one(id);
    await this.prisma.school.delete({ where: { id } });
    return { message: "Escola excluída." };
  }
}
