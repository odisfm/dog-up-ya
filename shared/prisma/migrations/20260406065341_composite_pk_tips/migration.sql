/*
  Warnings:

  - The primary key for the `Tip` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Tip` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tip" DROP CONSTRAINT "Tip_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Tip_pkey" PRIMARY KEY ("gameId", "sourceName");
