import { BadRequestException, NotFoundException } from "@nestjs/common";
import { FinanceService } from "../src/finance/finance.service";

describe("FinanceService payments and isolation", () => {
  const payment = { findFirst: jest.fn(), create: jest.fn() };
  const transaction = { findFirst: jest.fn(), update: jest.fn() };
  const tx = { financialTransaction: transaction, financialPayment: payment };
  const prisma = {
    $transaction: jest.fn((callback: (client: typeof tx) => unknown) =>
      callback(tx),
    ),
  };
  const service = new FinanceService(prisma as never);

  beforeEach(() => jest.clearAllMocks());

  it("records a partial payment without replacing the original amount", async () => {
    transaction.findFirst.mockResolvedValue({
      id: "one",
      ownerId: "tenant-a",
      amountCents: 60000,
      paidCents: 0,
      status: "PENDING",
    });
    transaction.update.mockResolvedValue({
      id: "one",
      amountCents: 60000,
      paidCents: 40000,
      status: "PARTIAL",
    });
    payment.create.mockResolvedValue({ id: "payment" });
    const result = await service.pay(
      "tenant-a",
      "one",
      { amountCents: 40000, method: "PIX", paidAt: "2026-08-10T12:00:00.000Z" },
      "request-1",
    );
    expect(result).toMatchObject({
      amountCents: 60000,
      paidCents: 40000,
      status: "PARTIAL",
    });
    expect(payment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          amountCents: 40000,
          idempotencyKey: "request-1",
        }),
      }),
    );
  });

  it("marks the receivable paid when the remaining balance is received", async () => {
    transaction.findFirst.mockResolvedValue({
      id: "one",
      ownerId: "tenant-a",
      amountCents: 60000,
      paidCents: 40000,
      status: "PARTIAL",
    });
    transaction.update.mockResolvedValue({
      id: "one",
      amountCents: 60000,
      paidCents: 60000,
      status: "PAID",
    });
    payment.create.mockResolvedValue({ id: "payment-2" });
    await expect(
      service.pay(
        "tenant-a",
        "one",
        {
          amountCents: 20000,
          method: "PIX",
          paidAt: "2026-08-11T12:00:00.000Z",
        },
        "request-2",
      ),
    ).resolves.toMatchObject({ status: "PAID" });
  });

  it("rejects overpayment", async () => {
    transaction.findFirst.mockResolvedValue({
      id: "one",
      ownerId: "tenant-a",
      amountCents: 60000,
      paidCents: 40000,
      status: "PARTIAL",
    });
    await expect(
      service.pay("tenant-a", "one", {
        amountCents: 20001,
        method: "PIX",
        paidAt: "2026-08-11T12:00:00.000Z",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("does not reveal a transaction belonging to another owner", async () => {
    transaction.findFirst.mockResolvedValue(null);
    await expect(
      service.pay("tenant-b", "tenant-a-item", {
        amountCents: 100,
        method: "CASH",
        paidAt: "2026-08-11T12:00:00.000Z",
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(transaction.findFirst).toHaveBeenCalledWith({
      where: { id: "tenant-a-item", ownerId: "tenant-b" },
    });
  });
});
