-- AlterTable
ALTER TABLE "Season" ADD COLUMN     "premierTeamId" UUID;

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_premierTeamId_fkey" FOREIGN KEY ("premierTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
