-- CreateEnum
CREATE TYPE "FinancialTransactionType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "FinancialStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'CASH', 'CARD', 'BOLETO', 'TRANSFER', 'DIRECT_DEBIT', 'OTHER');

-- CreateTable
CREATE TABLE "FinancialCategory" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FinancialTransactionType" NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialTransaction" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "type" "FinancialTransactionType" NOT NULL,
    "description" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "paidCents" INTEGER NOT NULL DEFAULT 0,
    "status" "FinancialStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" DATE NOT NULL,
    "competence" DATE NOT NULL,
    "paymentMethod" "PaymentMethod",
    "notes" TEXT,
    "categoryId" TEXT,
    "studentId" TEXT,
    "guardianId" TEXT,
    "vehicleId" TEXT,
    "billingId" TEXT,
    "recurrenceKey" TEXT,
    "installmentNumber" INTEGER,
    "installmentCount" INTEGER,
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialPayment" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL,
    "reversedAt" TIMESTAMP(3),
    "reversalReason" TEXT,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentBilling" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "guardianId" TEXT,
    "monthlyAmountCents" INTEGER NOT NULL,
    "discountCents" INTEGER NOT NULL DEFAULT 0,
    "dueDay" INTEGER NOT NULL,
    "preferredMethod" "PaymentMethod",
    "startsOn" DATE NOT NULL,
    "endsOn" DATE,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentBilling_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelLog" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "fueledOn" DATE NOT NULL,
    "station" TEXT,
    "fuelType" TEXT NOT NULL,
    "liters" DECIMAL(10,3) NOT NULL,
    "pricePerLiterCents" INTEGER NOT NULL,
    "mileage" INTEGER NOT NULL,
    "fullTank" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FuelLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialAuditLog" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FinancialCategory_ownerId_archivedAt_idx" ON "FinancialCategory"("ownerId", "archivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialCategory_ownerId_name_type_key" ON "FinancialCategory"("ownerId", "name", "type");

-- CreateIndex
CREATE INDEX "FinancialTransaction_ownerId_status_dueDate_idx" ON "FinancialTransaction"("ownerId", "status", "dueDate");

-- CreateIndex
CREATE INDEX "FinancialTransaction_ownerId_type_competence_idx" ON "FinancialTransaction"("ownerId", "type", "competence");

-- CreateIndex
CREATE INDEX "FinancialTransaction_studentId_idx" ON "FinancialTransaction"("studentId");

-- CreateIndex
CREATE INDEX "FinancialTransaction_vehicleId_idx" ON "FinancialTransaction"("vehicleId");

-- CreateIndex
CREATE INDEX "FinancialTransaction_categoryId_idx" ON "FinancialTransaction"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialTransaction_ownerId_recurrenceKey_dueDate_key" ON "FinancialTransaction"("ownerId", "recurrenceKey", "dueDate");

-- CreateIndex
CREATE INDEX "FinancialPayment_transactionId_paidAt_idx" ON "FinancialPayment"("transactionId", "paidAt");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialPayment_transactionId_idempotencyKey_key" ON "FinancialPayment"("transactionId", "idempotencyKey");

-- CreateIndex
CREATE INDEX "StudentBilling_ownerId_active_idx" ON "StudentBilling"("ownerId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "StudentBilling_ownerId_studentId_startsOn_key" ON "StudentBilling"("ownerId", "studentId", "startsOn");

-- CreateIndex
CREATE UNIQUE INDEX "FuelLog_transactionId_key" ON "FuelLog"("transactionId");

-- CreateIndex
CREATE INDEX "FuelLog_ownerId_vehicleId_fueledOn_idx" ON "FuelLog"("ownerId", "vehicleId", "fueledOn");

-- CreateIndex
CREATE INDEX "FinancialAuditLog_ownerId_transactionId_createdAt_idx" ON "FinancialAuditLog"("ownerId", "transactionId", "createdAt");

-- AddForeignKey
ALTER TABLE "FinancialCategory" ADD CONSTRAINT "FinancialCategory_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FinancialCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "Guardian"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_billingId_fkey" FOREIGN KEY ("billingId") REFERENCES "StudentBilling"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialPayment" ADD CONSTRAINT "FinancialPayment_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "FinancialTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentBilling" ADD CONSTRAINT "StudentBilling_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentBilling" ADD CONSTRAINT "StudentBilling_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentBilling" ADD CONSTRAINT "StudentBilling_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "Guardian"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelLog" ADD CONSTRAINT "FuelLog_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelLog" ADD CONSTRAINT "FuelLog_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelLog" ADD CONSTRAINT "FuelLog_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "FinancialTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialAuditLog" ADD CONSTRAINT "FinancialAuditLog_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialAuditLog" ADD CONSTRAINT "FinancialAuditLog_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "FinancialTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

