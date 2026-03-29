/*
  Warnings:

  - A unique constraint covering the columns `[seasonId,roundNumber]` on the table `Round` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Round_seasonId_roundNumber_key" ON "Round"("seasonId", "roundNumber");
