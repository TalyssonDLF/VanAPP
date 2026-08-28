import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateStudentDto,
  StudentGuardianDto,
  StudentQueryDto,
  UpdateStudentDto,
} from "./dto/student.dto";
import { addressKey, GeocodingService } from "../geocoding/geocoding.service";

const studentSelect = {
  id: true,
  name: true,
  birthDate: true,
  document: true,
  status: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  schoolId: true,
} satisfies Prisma.StudentSelect;
@Injectable()
export class StudentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geocoding: GeocodingService,
  ) {}
  private addressData(address: NonNullable<CreateStudentDto["address"]>) {
    return {
      street: address.street.trim(),
      number: address.number?.trim(),
      complement: address.complement?.trim(),
      neighborhood: address.neighborhood?.trim(),
      city: address.city.trim(),
      state: address.state.trim().toUpperCase(),
      postalCode: address.postalCode,
      latitude: null,
      longitude: null,
      geocodingStatus: "PENDING" as const,
      geocodingError: null,
      geocodedAt: null,
    };
  }
  private async locatedAddress(
    address: NonNullable<CreateStudentDto["address"]>,
  ) {
    const data = this.addressData(address);
    try {
      const result = await this.geocoding.geocode(address);
      return result
        ? {
            ...data,
            ...result,
            geocodingStatus: "LOCATED" as const,
            geocodedAt: new Date(),
          }
        : data;
    } catch {
      return data;
    }
  }
  private async ensureGuardians(guardians: StudentGuardianDto[]) {
    if (!guardians.length) return;
    const count = await this.prisma.guardian.count({
      where: { id: { in: guardians.map((item) => item.guardianId) } },
    });
    if (count !== guardians.length)
      throw new BadRequestException("Um ou mais responsáveis não existem.");
  }
  private conflict(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      throw new ConflictException("Já existe um aluno com este documento.");
    throw error;
  }
  async create(dto: CreateStudentDto) {
    await this.ensureGuardians(dto.guardians);
    try {
      return await this.prisma.student.create({
        data: {
          name: dto.name.trim(),
          birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
          document: dto.document,
          status: dto.status,
          notes: dto.notes,
          schoolId: dto.schoolId,
          guardians: {
            create: dto.guardians.map((item) => ({
              guardianId: item.guardianId,
              relationship: item.relationship,
            })),
          },
          ...(dto.address && {
            address: { create: await this.locatedAddress(dto.address) },
          }),
        },
        select: studentSelect,
      });
    } catch (error) {
      return this.conflict(error);
    }
  }
  async list(query: StudentQueryDto) {
    const search = query.search?.trim();
    const where: Prisma.StudentWhereInput = {
      ...(query.status && { status: query.status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { document: { contains: search.replace(/\D/g, "") } },
        ],
      }),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.student.findMany({
        where,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        orderBy: { name: "asc" },
        select: { ...studentSelect, _count: { select: { guardians: true } } },
      }),
      this.prisma.student.count({ where }),
    ]);
    return {
      data: data.map(({ _count, ...student }) => ({
        ...student,
        guardianCount: _count.guardians,
      })),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  }
  async findOne(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      select: {
        ...studentSelect,
        address: true,
        guardians: {
          select: {
            relationship: true,
            guardian: {
              select: { id: true, name: true, phone: true, email: true },
            },
          },
          orderBy: { guardian: { name: "asc" } },
        },
      },
    });
    if (!student) throw new NotFoundException("Aluno não encontrado.");
    return {
      ...student,
      guardians: student.guardians.map(({ relationship, guardian }) => ({
        ...guardian,
        relationship,
      })),
    };
  }
  async update(id: string, dto: UpdateStudentDto) {
    const existing = await this.findOne(id);
    if (dto.guardians) await this.ensureGuardians(dto.guardians);
    try {
      return await this.prisma.$transaction(async (tx) => {
        const student = await tx.student.update({
          where: { id },
          data: {
            ...(dto.name !== undefined && { name: dto.name.trim() }),
            ...(dto.birthDate !== undefined && {
              birthDate: new Date(dto.birthDate),
            }),
            document: dto.document,
            ...(dto.status !== undefined && { status: dto.status }),
            notes: dto.notes,
            ...(dto.schoolId !== undefined && {
              schoolId: dto.schoolId || null,
            }),
            ...(dto.address && {
              address: {
                upsert: {
                  create: await this.locatedAddress(dto.address),
                  update:
                    addressKey(existing.address ?? {}) ===
                    addressKey(dto.address)
                      ? {
                          street: dto.address.street.trim(),
                          number: dto.address.number?.trim(),
                          complement: dto.address.complement?.trim(),
                          neighborhood: dto.address.neighborhood?.trim(),
                          city: dto.address.city.trim(),
                          state: dto.address.state.trim().toUpperCase(),
                          postalCode: dto.address.postalCode,
                        }
                      : await this.locatedAddress(dto.address),
                },
              },
            }),
          },
          select: studentSelect,
        });
        if (dto.guardians) {
          await tx.studentGuardian.deleteMany({ where: { studentId: id } });
          await tx.studentGuardian.createMany({
            data: dto.guardians.map((item) => ({
              studentId: id,
              guardianId: item.guardianId,
              relationship: item.relationship,
            })),
          });
        }
        return student;
      });
    } catch (error) {
      return this.conflict(error);
    }
  }
  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.student.delete({ where: { id } });
    return { message: "Aluno excluído." };
  }
  async mapData(vehicleId?: string) {
    const [students, vehicles, schools] = await Promise.all([
      this.prisma.student.findMany({
        orderBy: [{ name: "asc" }, { id: "asc" }],
        select: {
          id: true,
          name: true,
          status: true,
          schoolId: true,
          school: { select: { id: true, name: true, mapColor: true } },
          address: {
            select: {
              street: true,
              number: true,
              complement: true,
              neighborhood: true,
              city: true,
              state: true,
              postalCode: true,
              latitude: true,
              longitude: true,
              geocodingStatus: true,
              geocodingError: true,
            },
          },
        },
      }),
      this.prisma.vehicle.findMany({
        where: { status: "ACTIVE" },
        orderBy: [{ brand: "asc" }, { model: "asc" }],
        select: {
          id: true,
          plate: true,
          brand: true,
          model: true,
          startPostalCode: true,
          startStreet: true,
          startNumber: true,
          startComplement: true,
          startNeighborhood: true,
          startCity: true,
          startState: true,
          startLatitude: true,
          startLongitude: true,
          defaultDriver: { select: { id: true, name: true } },
        },
      }),
      this.prisma.school?.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          mapColor: true,
          postalCode: true,
          street: true,
          number: true,
          complement: true,
          neighborhood: true,
          city: true,
          state: true,
          latitude: true,
          longitude: true,
          _count: { select: { students: true } },
        },
      }) ?? Promise.resolve([]),
    ]);
    const selected =
      vehicles.find((vehicle) => vehicle.id === vehicleId) ??
      vehicles[0] ??
      null;
    return {
      students: students.map((student, index) => ({
        ...student,
        order: index + 1,
        address: student.address
          ? [student.address.street, student.address.number]
              .filter(Boolean)
              .join(", ")
          : null,
        addressDetails: student.address,
      })),
      vehicles,
      selectedVehicle: selected,
      schools: schools.map(({ _count, ...school }) => ({
        ...school,
        studentCount: _count.students,
      })),
      waypoints: [
        ...(selected?.startLatitude != null && selected.startLongitude != null
          ? [
              {
                id: selected.id,
                type: "vehicle_start",
                latitude: selected.startLatitude,
                longitude: selected.startLongitude,
              },
            ]
          : []),
        ...students
          .filter(
            (s) => s.address?.latitude != null && s.address.longitude != null,
          )
          .map((s) => ({
            id: s.id,
            type: "student",
            latitude: s.address!.latitude!,
            longitude: s.address!.longitude!,
            schoolId: s.schoolId ?? undefined,
          })),
        ...schools
          .filter((s) => s.latitude != null && s.longitude != null)
          .map((s) => ({
            id: s.id,
            type: "school",
            latitude: s.latitude!,
            longitude: s.longitude!,
            schoolId: s.id,
          })),
      ],
    };
  }
  async geocodePending(limit = 5) {
    const addresses = await this.prisma.studentAddress.findMany({
      where: { geocodingStatus: { in: ["PENDING", "FAILED"] } },
      orderBy: { updatedAt: "asc" },
      take: Math.min(Math.max(limit, 1), 10),
    });
    for (const address of addresses) {
      const query = [
        address.street,
        address.number,
        address.neighborhood,
        address.city,
        address.state,
        address.postalCode,
        "Brasil",
      ]
        .filter(Boolean)
        .join(", ");
      try {
        const result = await this.geocoding.geocode(query);
        await this.prisma.studentAddress.update({
          where: { id: address.id },
          data: result
            ? {
                ...result,
                geocodingStatus: "LOCATED",
                geocodingError: null,
                geocodedAt: new Date(),
              }
            : {
                latitude: null,
                longitude: null,
                geocodingStatus: "FAILED",
                geocodingError: "Endereço não localizado",
                geocodedAt: new Date(),
              },
        });
      } catch {
        await this.prisma.studentAddress.update({
          where: { id: address.id },
          data: {
            geocodingStatus: "FAILED",
            geocodingError: "Falha temporária ao localizar endereço",
            geocodedAt: new Date(),
          },
        });
      }
    }
    return { processed: addresses.length };
  }
}
