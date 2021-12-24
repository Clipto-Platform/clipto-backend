-- AlterTable
ALTER TABLE "VerifiedUser" ALTER COLUMN "deliveryTime" SET DATA TYPE DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Request" (
    "id" SERIAL NOT NULL,
    "requester" TEXT NOT NULL,
    "creator" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "deadline" TEXT NOT NULL,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "txHash" TEXT NOT NULL,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Request_txHash_key" ON "Request"("txHash");
