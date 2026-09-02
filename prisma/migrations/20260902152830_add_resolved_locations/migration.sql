-- CreateTable
CREATE TABLE "resolved_locations" (
    "locationId" TEXT NOT NULL,
    "placeData" JSONB NOT NULL,
    "resolvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resolved_locations_pkey" PRIMARY KEY ("locationId")
);

-- AddForeignKey
ALTER TABLE "resolved_locations" ADD CONSTRAINT "resolved_locations_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
