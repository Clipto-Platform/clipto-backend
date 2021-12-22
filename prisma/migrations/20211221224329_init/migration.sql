-- CreateTable
CREATE TABLE "VerifiedUser" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "twitterHandle" TEXT NOT NULL,

    CONSTRAINT "VerifiedUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VerifiedUser_address_key" ON "VerifiedUser"("address");

-- CreateIndex
CREATE UNIQUE INDEX "VerifiedUser_twitterHandle_key" ON "VerifiedUser"("twitterHandle");
