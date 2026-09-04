-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "suggestedById" TEXT;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_suggestedById_fkey" FOREIGN KEY ("suggestedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
