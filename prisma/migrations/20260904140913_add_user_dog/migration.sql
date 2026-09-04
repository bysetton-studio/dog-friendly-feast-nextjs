-- CreateTable
CREATE TABLE "user_dog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_dog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_dog" ADD CONSTRAINT "user_dog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
