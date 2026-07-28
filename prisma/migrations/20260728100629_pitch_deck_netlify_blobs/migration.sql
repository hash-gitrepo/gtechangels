/*
  Warnings:

  - You are about to drop the column `pitchDeckPublicId` on the `startups` table. All the data in the column will be lost.
  - You are about to drop the column `pitchDeckUrl` on the `startups` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "startups" DROP COLUMN "pitchDeckPublicId",
DROP COLUMN "pitchDeckUrl",
ADD COLUMN     "pitchDeckKey" TEXT;
