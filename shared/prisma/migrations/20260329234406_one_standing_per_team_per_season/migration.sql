/*
  Warnings:

  - The primary key for the `Standing` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `roundId` on the `Standing` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Standing" DROP CONSTRAINT "Standing_roundId_fkey";

-- AlterTable
ALTER TABLE "Standing" DROP CONSTRAINT "Standing_pkey",
DROP COLUMN "roundId",
ADD CONSTRAINT "Standing_pkey" PRIMARY KEY ("teamId", "seasonId");
