/*
  Warnings:

  - You are about to drop the column `likes` on the `Level` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RatingType" AS ENUM ('QUALITY', 'DIFFICULTY');

-- AlterTable
ALTER TABLE "Level" DROP COLUMN "likes";

-- CreateTable
CREATE TABLE "Rating" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "RatingType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "userLevelId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "levelId" INTEGER NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rating_userLevelId_key" ON "Rating"("userLevelId");

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
