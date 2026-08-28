import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DriverStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateVehicleDocumentDto,
  CreateVehicleDto,
  UpdateVehicleDocumentDto,
  UpdateVehicleDto,
  VehicleQueryDto,
} from "./dto/vehicle.dto";
import { addressKey, GeocodingService } from "../geocoding/geocoding.service";
import {
  DOCUMENT_EXPIRING_SOON_DAYS,
  documentStatus,
} from "./vehicle.constants";
const driver = { select: { id: true, name: true, status: true } };
const detail = {
  defaultDriver: driver,
  documents: { orderBy: { expiresAt: "asc" as const } },
};
@Injectable()
export class VehiclesService {
  constructor(
    private prisma: PrismaService,
    private geocoding: GeocodingService,
  ) {}
  private async activeDriver(id: string | undefined | null) {
    if (!id) return;
    const d = await this.prisma.driver.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!d) throw new BadRequestException("Motorista padrão não encontrado.");
    if (d.status !== DriverStatus.ACTIVE)
      throw new BadRequestException(
        "Somente motoristas ativos podem ser vinculados como motorista padrão.",
      );
  }
  private conflict(e: unknown): never {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      const t = String(e.meta?.target);
      throw new ConflictException(
        t.includes("renavam")
          ? "Já existe um veículo cadastrado com este RENAVAM."
          : "Já existe um veículo cadastrado com esta placa.",
      );
    }
    throw e;
  }
  private async data(
    dto: CreateVehicleDto | UpdateVehicleDto,
    old?: Awaited<ReturnType<VehiclesService["findOne"]>>,
  ) {
    const address = dto.startAddress,
      changed =
        address &&
        (!old ||
          addressKey({
            street: old.startStreet,
            number: old.startNumber,
            neighborhood: old.startNeighborhood,
            city: old.startCity,
            state: old.startState,
            postalCode: old.startPostalCode,
          }) !== addressKey(address));
    let coordinates: {
      startLatitude?: number | null;
      startLongitude?: number | null;
    } = {};
    if (changed && address) {
      try {
        const result = await this.geocoding.geocode(address);
        coordinates = {
          startLatitude: result?.latitude ?? null,
          startLongitude: result?.longitude ?? null,
        };
      } catch {
        coordinates = { startLatitude: null, startLongitude: null };
      }
    }
    return {
      plate: dto.plate,
      renavam: dto.renavam,
      brand: dto.brand,
      model: dto.model,
      manufactureYear: dto.manufactureYear,
      modelYear: dto.modelYear,
      color: dto.color,
      passengerCapacity: dto.passengerCapacity,
      type: dto.type,
      status: dto.status,
      currentMileage: dto.currentMileage,
      defaultDriverId: dto.defaultDriverId,
      notes: dto.notes,
      ...(address && {
        startPostalCode: address.postalCode,
        startStreet: address.street.trim(),
        startNumber: address.number?.trim(),
        startComplement: address.complement?.trim(),
        startNeighborhood: address.neighborhood?.trim(),
        startCity: address.city.trim(),
        startState: address.state.trim().toUpperCase(),
      }),
      ...coordinates,
    };
  }
  private result<T extends { documents: { expiresAt: Date | null }[] }>(v: T) {
    return {
      ...v,
      documents: v.documents.map((d) => ({
        ...d,
        documentStatus: documentStatus(d.expiresAt),
      })),
    };
  }
  async create(dto: CreateVehicleDto) {
    await this.activeDriver(dto.defaultDriverId);
    try {
      return await this.prisma.vehicle.create({
        data: (await this.data(dto)) as Prisma.VehicleUncheckedCreateInput,
        include: detail,
      });
    } catch (e) {
      return this.conflict(e);
    }
  }
  async list(q: VehicleQueryDto, reference = new Date()) {
    const search = q.search?.trim(),
      today = new Date(
        Date.UTC(
          reference.getUTCFullYear(),
          reference.getUTCMonth(),
          reference.getUTCDate(),
        ),
      ),
      soon = new Date(today);
    soon.setUTCDate(soon.getUTCDate() + DOCUMENT_EXPIRING_SOON_DAYS);
    const doc: Prisma.VehicleWhereInput =
      q.documentStatus === "EXPIRED"
        ? { documents: { some: { expiresAt: { lt: today } } } }
        : q.documentStatus === "EXPIRING_SOON"
          ? { documents: { some: { expiresAt: { gte: today, lte: soon } } } }
          : q.documentStatus === "REGULAR"
            ? { NOT: { documents: { some: { expiresAt: { lte: soon } } } } }
            : {};
    const where: Prisma.VehicleWhereInput = {
      ...doc,
      status: q.status,
      type: q.type,
      defaultDriverId: q.defaultDriverId,
      ...(search && {
        OR: [
          {
            plate: { contains: search.replace(/\W/g, ""), mode: "insensitive" },
          },
          { renavam: { contains: search.replace(/\D/g, "") } },
          { brand: { contains: search, mode: "insensitive" } },
          { model: { contains: search, mode: "insensitive" } },
        ],
      }),
    };
    const select = {
      id: true,
      plate: true,
      brand: true,
      model: true,
      modelYear: true,
      passengerCapacity: true,
      type: true,
      status: true,
      defaultDriver: driver,
      documents: { select: { expiresAt: true } },
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.vehicle.findMany({
        where,
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
        orderBy: { brand: "asc" },
        select,
      }),
      this.prisma.vehicle.count({ where }),
    ]);
    return {
      data: data.map((v) => {
        const statuses = v.documents.map((d) =>
          documentStatus(d.expiresAt, reference),
        );
        return {
          ...v,
          documents: undefined,
          documentSummary: {
            expired: statuses.filter((x) => x === "EXPIRED").length,
            expiringSoon: statuses.filter((x) => x === "EXPIRING_SOON").length,
          },
        };
      }),
      pagination: {
        page: q.page,
        pageSize: q.pageSize,
        total,
        totalPages: Math.ceil(total / q.pageSize),
      },
    };
  }
  async findOne(id: string) {
    const v = await this.prisma.vehicle.findUnique({
      where: { id },
      include: detail,
    });
    if (!v) throw new NotFoundException("Veículo não encontrado.");
    return this.result(v);
  }
  async update(id: string, dto: UpdateVehicleDto) {
    const old = await this.findOne(id);
    if (Object.prototype.hasOwnProperty.call(dto, "defaultDriverId"))
      await this.activeDriver(dto.defaultDriverId);
    try {
      return this.result(
        await this.prisma.vehicle.update({
          where: { id },
          data: await this.data(dto, old),
          include: detail,
        }),
      );
    } catch (e) {
      return this.conflict(e);
    }
  }
  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.vehicle.delete({ where: { id } });
    return { message: "Veículo excluído." };
  }
  async addDocument(vehicleId: string, dto: CreateVehicleDocumentDto) {
    await this.findOne(vehicleId);
    const d = await this.prisma.vehicleDocument.create({
      data: {
        vehicleId,
        type: dto.type,
        identifier: dto.identifier,
        issuedAt: dto.issuedAt ? new Date(dto.issuedAt) : null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        notes: dto.notes,
      },
    });
    return { ...d, documentStatus: documentStatus(d.expiresAt) };
  }
  private async document(vehicleId: string, id: string) {
    const d = await this.prisma.vehicleDocument.findFirst({
      where: { id, vehicleId },
    });
    if (!d) throw new NotFoundException("Documento do veículo não encontrado.");
    return d;
  }
  async updateDocument(
    vehicleId: string,
    id: string,
    dto: UpdateVehicleDocumentDto,
  ) {
    await this.document(vehicleId, id);
    const d = await this.prisma.vehicleDocument.update({
      where: { id },
      data: {
        type: dto.type,
        identifier: dto.identifier,
        issuedAt: dto.issuedAt ? new Date(dto.issuedAt) : dto.issuedAt,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : dto.expiresAt,
        notes: dto.notes,
      },
    });
    return { ...d, documentStatus: documentStatus(d.expiresAt) };
  }
  async removeDocument(vehicleId: string, id: string) {
    await this.document(vehicleId, id);
    await this.prisma.vehicleDocument.delete({ where: { id } });
    return { message: "Documento excluído." };
  }
}
