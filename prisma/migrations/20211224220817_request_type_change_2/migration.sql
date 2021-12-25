/*
  Warnings:

  - You are about to alter the column `deliveryTime` on the `VerifiedUser` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "amount" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "VerifiedUser" ALTER COLUMN "deliveryTime" SET DATA TYPE INTEGER;
