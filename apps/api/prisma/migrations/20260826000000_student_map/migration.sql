-- Persist student geocoding results and an optional vehicle departure point.
CREATE TYPE "GeocodingStatus" AS ENUM ('PENDING', 'LOCATED', 'FAILED');

ALTER TABLE "Vehicle"
  ADD COLUMN "baseAddress" TEXT,
  ADD COLUMN "baseLatitude" DOUBLE PRECISION,
  ADD COLUMN "baseLongitude" DOUBLE PRECISION;

CREATE TABLE "StudentAddress" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "street" TEXT NOT NULL,
  "number" TEXT,
  "complement" TEXT,
  "neighborhood" TEXT,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "postalCode" TEXT,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "geocodingStatus" "GeocodingStatus" NOT NULL DEFAULT 'PENDING',
  "geocodingError" TEXT,
  "geocodedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudentAddress_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "StudentAddress_studentId_key" ON "StudentAddress"("studentId");
CREATE INDEX "StudentAddress_geocodingStatus_idx" ON "StudentAddress"("geocodingStatus");
ALTER TABLE "StudentAddress" ADD CONSTRAINT "StudentAddress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
