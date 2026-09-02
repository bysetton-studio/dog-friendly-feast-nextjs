-- CreateTable
CREATE TABLE "maps_rate_limit" (
    "date" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "maps_rate_limit_pkey" PRIMARY KEY ("date")
);
