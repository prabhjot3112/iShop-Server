/*
  Warnings:

  - You are about to drop the column `auth` on the `NotificationSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `p256dh` on the `NotificationSubscription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[endpoint]` on the table `NotificationSubscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `keys` to the `NotificationSubscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NotificationSubscription" DROP COLUMN "auth",
DROP COLUMN "p256dh",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "keys" JSONB NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "NotificationSubscription_endpoint_key" ON "NotificationSubscription"("endpoint");
