import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import {
  BillingDto,
  CreateTransactionDto,
  FuelDto,
  ListTransactionsDto,
  PaymentDto,
  UpdateTransactionDto,
} from "./dto/finance.dto";

const date = (value: string) => new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
const addMonths = (source: Date, count: number, day = source.getUTCDate()) => {
  const target = new Date(
    Date.UTC(source.getUTCFullYear(), source.getUTCMonth() + count, 1),
  );
  target.setUTCDate(
    Math.min(
      day,
      new Date(
        Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
      ).getUTCDate(),
    ),
  );
  return target;
};

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  async list(ownerId: string, dto: ListTransactionsDto) {
    await this.refreshOverdue(ownerId);
    const where: Prisma.FinancialTransactionWhereInput = {
      ownerId,
      type: dto.type,
      status: dto.status,
      studentId: dto.studentId,
      vehicleId: dto.vehicleId,
    };
    if (dto.search)
      where.OR = [
        { description: { contains: dto.search, mode: "insensitive" } },
        { student: { name: { contains: dto.search, mode: "insensitive" } } },
        { guardian: { name: { contains: dto.search, mode: "insensitive" } } },
      ];
    if (dto.from || dto.to)
      where.dueDate = {
        ...(dto.from ? { gte: date(dto.from) } : {}),
        ...(dto.to ? { lte: date(dto.to) } : {}),
      };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.financialTransaction.findMany({
        where,
        include: {
          category: true,
          student: true,
          guardian: true,
          vehicle: true,
          payments: {
            where: { reversedAt: null },
            orderBy: { paidAt: "desc" },
          },
        },
        orderBy: [{ dueDate: "desc" }, { createdAt: "desc" }],
        skip: (dto.page - 1) * dto.pageSize,
        take: dto.pageSize,
      }),
      this.prisma.financialTransaction.count({ where }),
    ]);
    return { data, total, page: dto.page, pageSize: dto.pageSize };
  }

  async create(ownerId: string, dto: CreateTransactionDto) {
    await this.validateLinks(ownerId, dto);
    const count = dto.installmentCount ?? 1;
    const base = Math.floor(dto.amountCents / count);
    const remainder = dto.amountCents % count;
    const key = count > 1 ? crypto.randomUUID() : null;
    const due = date(dto.dueDate);
    const competence = date(dto.competence);
    return this.prisma.$transaction(
      Array.from({ length: count }, (_, index) =>
        this.prisma.financialTransaction.create({
          data: {
            ownerId,
            type: dto.type,
            description:
              count > 1
                ? `${dto.description} (${index + 1}/${count})`
                : dto.description,
            amountCents: base + (index < remainder ? 1 : 0),
            dueDate: addMonths(due, index),
            competence: addMonths(competence, index),
            paymentMethod: dto.paymentMethod,
            notes: dto.notes,
            categoryId: dto.categoryId,
            studentId: dto.studentId,
            guardianId: dto.guardianId,
            vehicleId: dto.vehicleId,
            recurrenceKey: key,
            installmentNumber: count > 1 ? index + 1 : null,
            installmentCount: count > 1 ? count : null,
            auditLogs: { create: { ownerId, action: "CREATED" } },
          },
          include: { payments: true },
        }),
      ),
    );
  }

  async update(ownerId: string, id: string, dto: UpdateTransactionDto) {
    const current = await this.owned(ownerId, id);
    if (current.status === "CANCELLED")
      throw new BadRequestException(
        "Lançamentos cancelados não podem ser editados.",
      );
    if (dto.amountCents !== undefined && dto.amountCents < current.paidCents)
      throw new BadRequestException(
        "O valor não pode ser menor que o total já pago.",
      );
    if (dto.categoryId)
      await this.validateLinks(ownerId, { categoryId: dto.categoryId });
    return this.prisma.financialTransaction.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? date(dto.dueDate) : undefined,
        competence: dto.competence ? date(dto.competence) : undefined,
        auditLogs: { create: { ownerId, action: "UPDATED" } },
      },
    });
  }

  async pay(
    ownerId: string,
    id: string,
    dto: PaymentDto,
    idempotencyKey?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.financialTransaction.findFirst({
        where: { id, ownerId },
      });
      if (!item) throw new NotFoundException("Lançamento não encontrado.");
      if (item.status === "CANCELLED")
        throw new BadRequestException("Lançamento cancelado.");
      if (dto.amountCents > item.amountCents - item.paidCents)
        throw new BadRequestException("Pagamento maior que o saldo pendente.");
      if (idempotencyKey) {
        const existing = await tx.financialPayment.findFirst({
          where: { transactionId: id, idempotencyKey },
        });
        if (existing) return item;
      }
      const paidCents = item.paidCents + dto.amountCents;
      await tx.financialPayment.create({
        data: {
          transactionId: id,
          amountCents: dto.amountCents,
          method: dto.method,
          paidAt: new Date(dto.paidAt),
          idempotencyKey,
        },
      });
      return tx.financialTransaction.update({
        where: { id },
        data: {
          paidCents,
          status: paidCents === item.amountCents ? "PAID" : "PARTIAL",
          paymentMethod: dto.method,
          auditLogs: {
            create: {
              ownerId,
              action:
                paidCents === item.amountCents ? "PAID" : "PARTIALLY_PAID",
              details: { amountCents: dto.amountCents },
            },
          },
        },
      });
    });
  }

  async cancel(ownerId: string, id: string, reason: string) {
    const item = await this.owned(ownerId, id);
    if (item.paidCents)
      throw new BadRequestException("Estorne os pagamentos antes de cancelar.");
    return this.prisma.financialTransaction.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancellationReason: reason,
        auditLogs: {
          create: { ownerId, action: "CANCELLED", details: { reason } },
        },
      },
    });
  }

  async dashboard(ownerId: string) {
    await this.refreshOverdue(ownerId);
    const now = new Date();
    const start = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const end = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
    );
    const items = await this.prisma.financialTransaction.findMany({
      where: { ownerId, status: { not: "CANCELLED" } },
      select: {
        type: true,
        amountCents: true,
        paidCents: true,
        status: true,
        dueDate: true,
        competence: true,
      },
    });
    const month = items.filter(
      (x) => x.competence >= start && x.competence < end,
    );
    const income = month
      .filter((x) => x.type === "INCOME")
      .reduce((s, x) => s + x.paidCents, 0);
    const expense = month
      .filter((x) => x.type === "EXPENSE")
      .reduce((s, x) => s + x.paidCents, 0);
    const received = items
      .filter((x) => x.type === "INCOME")
      .reduce((s, x) => s + x.paidCents, 0);
    const spent = items
      .filter((x) => x.type === "EXPENSE")
      .reduce((s, x) => s + x.paidCents, 0);
    const pending = (type: "INCOME" | "EXPENSE") =>
      items
        .filter((x) => x.type === type && !["PAID"].includes(x.status))
        .reduce((s, x) => s + x.amountCents - x.paidCents, 0);
    const overdue = items
      .filter((x) => x.type === "INCOME" && x.status === "OVERDUE")
      .reduce((s, x) => s + x.amountCents - x.paidCents, 0);
    const projection = (days: number) =>
      received -
      spent +
      items
        .filter(
          (x) =>
            x.dueDate <= new Date(now.getTime() + days * 86400000) &&
            x.status !== "PAID",
        )
        .reduce(
          (s, x) =>
            s + (x.type === "INCOME" ? 1 : -1) * (x.amountCents - x.paidCents),
          0,
        );
    return {
      balanceCents: received - spent,
      incomeCents: income,
      expenseCents: expense,
      resultCents: income - expense,
      receivableCents: pending("INCOME"),
      payableCents: pending("EXPENSE"),
      overdueCents: overdue,
      delinquencyRate: pending("INCOME")
        ? Math.round((overdue * 10000) / pending("INCOME")) / 100
        : 0,
      projection: { days30Cents: projection(30), days60Cents: projection(60) },
    };
  }

  async createBilling(ownerId: string, dto: BillingDto) {
    await this.validateLinks(ownerId, dto);
    return this.prisma.$transaction(async (tx) => {
      const billing = await tx.studentBilling.create({
        data: {
          ownerId,
          studentId: dto.studentId,
          guardianId: dto.guardianId,
          monthlyAmountCents: dto.monthlyAmountCents,
          discountCents: dto.discountCents,
          dueDay: dto.dueDay,
          preferredMethod: dto.preferredMethod,
          startsOn: date(dto.startsOn),
          endsOn: dto.endsOn ? date(dto.endsOn) : null,
        },
      });
      const start = date(dto.startsOn);
      const ends = dto.endsOn ? date(dto.endsOn) : null;
      for (let i = 0; i < dto.months; i++) {
        const due = addMonths(start, i, dto.dueDay);
        if (ends && due > ends) break;
        await tx.financialTransaction.create({
          data: {
            ownerId,
            type: "INCOME",
            description: `Mensalidade ${due.toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" })}`,
            amountCents: dto.monthlyAmountCents - dto.discountCents,
            dueDate: due,
            competence: new Date(
              Date.UTC(due.getUTCFullYear(), due.getUTCMonth(), 1),
            ),
            paymentMethod: dto.preferredMethod,
            studentId: dto.studentId,
            guardianId: dto.guardianId,
            billingId: billing.id,
            recurrenceKey: billing.id,
            auditLogs: {
              create: { ownerId, action: "GENERATED_FROM_BILLING" },
            },
          },
        });
      }
      return billing;
    });
  }

  async createFuel(ownerId: string, dto: FuelDto) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: dto.vehicleId },
    });
    if (!vehicle) throw new NotFoundException("Veículo não encontrado.");
    const total = Math.round(dto.liters * dto.pricePerLiterCents);
    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.financialTransaction.create({
        data: {
          ownerId,
          type: "EXPENSE",
          description: `Abastecimento - ${vehicle.plate}`,
          amountCents: total,
          paidCents: total,
          status: "PAID",
          dueDate: date(dto.fueledOn),
          competence: date(dto.fueledOn),
          vehicleId: dto.vehicleId,
          notes: dto.notes,
          auditLogs: { create: { ownerId, action: "CREATED_FROM_FUEL" } },
        },
      });
      return tx.fuelLog.create({
        data: {
          ownerId,
          vehicleId: dto.vehicleId,
          transactionId: transaction.id,
          fueledOn: date(dto.fueledOn),
          station: dto.station,
          fuelType: dto.fuelType,
          liters: dto.liters,
          pricePerLiterCents: dto.pricePerLiterCents,
          mileage: dto.mileage,
          fullTank: dto.fullTank,
          notes: dto.notes,
        },
        include: { transaction: true, vehicle: true },
      });
    });
  }

  private async refreshOverdue(ownerId: string) {
    await this.prisma.financialTransaction.updateMany({
      where: { ownerId, dueDate: { lt: new Date() }, status: "PENDING" },
      data: { status: "OVERDUE" },
    });
  }
  private async owned(ownerId: string, id: string) {
    const item = await this.prisma.financialTransaction.findFirst({
      where: { id, ownerId },
    });
    if (!item) throw new NotFoundException("Lançamento não encontrado.");
    return item;
  }
  private async validateLinks(
    ownerId: string,
    dto: {
      categoryId?: string;
      studentId?: string;
      guardianId?: string;
      vehicleId?: string;
    },
  ) {
    const checks = await Promise.all([
      dto.categoryId
        ? this.prisma.financialCategory.count({
            where: { id: dto.categoryId, ownerId },
          })
        : 1,
      dto.studentId
        ? this.prisma.student.count({ where: { id: dto.studentId } })
        : 1,
      dto.guardianId
        ? this.prisma.guardian.count({ where: { id: dto.guardianId } })
        : 1,
      dto.vehicleId
        ? this.prisma.vehicle.count({ where: { id: dto.vehicleId } })
        : 1,
    ]);
    if (checks.some((x) => !x))
      throw new BadRequestException(
        "Um dos vínculos informados não existe ou não está autorizado.",
      );
  }
}
