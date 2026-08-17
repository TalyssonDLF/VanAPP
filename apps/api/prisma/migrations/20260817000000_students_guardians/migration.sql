CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "GuardianRelationship" AS ENUM ('MOTHER', 'FATHER', 'GRANDMOTHER', 'GRANDFATHER', 'AUNT', 'UNCLE', 'BROTHER', 'SISTER', 'LEGAL_GUARDIAN', 'OTHER');

CREATE TABLE "Guardian" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "email" TEXT, "phone" TEXT NOT NULL,
  "document" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Guardian_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Student" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "birthDate" TIMESTAMP(3), "document" TEXT,
  "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE', "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "StudentGuardian" (
  "studentId" TEXT NOT NULL, "guardianId" TEXT NOT NULL,
  "relationship" "GuardianRelationship" NOT NULL,
  CONSTRAINT "StudentGuardian_pkey" PRIMARY KEY ("studentId", "guardianId")
);
CREATE UNIQUE INDEX "Guardian_document_key" ON "Guardian"("document");
CREATE INDEX "Guardian_name_idx" ON "Guardian"("name");
CREATE UNIQUE INDEX "Student_document_key" ON "Student"("document");
CREATE INDEX "Student_name_idx" ON "Student"("name");
CREATE INDEX "Student_status_idx" ON "Student"("status");
CREATE INDEX "StudentGuardian_guardianId_idx" ON "StudentGuardian"("guardianId");
ALTER TABLE "StudentGuardian" ADD CONSTRAINT "StudentGuardian_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentGuardian" ADD CONSTRAINT "StudentGuardian_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "Guardian"("id") ON DELETE CASCADE ON UPDATE CASCADE;
