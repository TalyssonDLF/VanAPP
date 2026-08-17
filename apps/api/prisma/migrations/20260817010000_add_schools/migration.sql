-- CreateEnum
CREATE TYPE "SchoolStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "postalCode" TEXT,
    "street" TEXT,
    "number" TEXT,
    "complement" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,
    "entryTime" TEXT,
    "exitTime" TEXT,
    "status" "SchoolStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Student" ADD COLUMN "schoolId" TEXT;

-- CreateIndex
CREATE INDEX "School_name_idx" ON "School"("name");
CREATE INDEX "School_status_idx" ON "School"("status");
CREATE INDEX "Student_schoolId_idx" ON "Student"("schoolId");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
