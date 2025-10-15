/*
  Warnings:

  - You are about to drop the `PredefinedCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."PredefinedCategory";

-- CreateTable
CREATE TABLE "PredefinedProductCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "PredefinedProductCategory_pkey" PRIMARY KEY ("id")
);
