-- All address fields are nullable to preserve existing records.
CREATE TABLE "School" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "mapColor" TEXT NOT NULL DEFAULT '#2563EB',
  "postalCode" TEXT, "street" TEXT, "number" TEXT, "complement" TEXT,
  "neighborhood" TEXT, "city" TEXT, "state" TEXT, "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "School_name_idx" ON "School"("name");
ALTER TABLE "Student" ADD COLUMN "schoolId" TEXT;
CREATE INDEX "Student_schoolId_idx" ON "Student"("schoolId");
ALTER TABLE "Student" ADD CONSTRAINT "Student_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Vehicle" ADD COLUMN "startPostalCode" TEXT;
ALTER TABLE "Vehicle" ADD COLUMN "startStreet" TEXT;
ALTER TABLE "Vehicle" ADD COLUMN "startNumber" TEXT;
ALTER TABLE "Vehicle" ADD COLUMN "startComplement" TEXT;
ALTER TABLE "Vehicle" ADD COLUMN "startNeighborhood" TEXT;
ALTER TABLE "Vehicle" ADD COLUMN "startCity" TEXT;
ALTER TABLE "Vehicle" ADD COLUMN "startState" TEXT;
ALTER TABLE "Vehicle" ADD COLUMN "startLatitude" DOUBLE PRECISION;
ALTER TABLE "Vehicle" ADD COLUMN "startLongitude" DOUBLE PRECISION;
