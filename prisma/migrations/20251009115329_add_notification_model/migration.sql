-- CreateTable
CREATE TABLE "NotificationSubscription" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,

    CONSTRAINT "NotificationSubscription_pkey" PRIMARY KEY ("id")
);
