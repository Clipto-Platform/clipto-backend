/*
  Warnings:

  - A unique constraint covering the columns `[userName]` on the table `VerifiedUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bio` to the `VerifiedUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryTime` to the `VerifiedUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profilePicture` to the `VerifiedUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userName` to the `VerifiedUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VerifiedUser" ADD COLUMN     "bio" TEXT NOT NULL,
ADD COLUMN     "deliveryTime" INTEGER NOT NULL,
ADD COLUMN     "demos" TEXT[],
ADD COLUMN     "profilePicture" TEXT NOT NULL,
ADD COLUMN     "userName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "VerifiedUser_userName_key" ON "VerifiedUser"("userName");
