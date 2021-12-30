/*
  Warnings:

  - Added the required column `requestId` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "requestId" INTEGER NOT NULL;
