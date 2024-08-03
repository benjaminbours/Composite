/*
  Warnings:

  - The values [NOT_FINISHED] on the enum `GameStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `endTime` on the `Game` table. All the data in the column will be lost.
  - Added the required column `device` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mode` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `startTime` on the `Game` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "GameMode" AS ENUM ('SINGLE_PLAYER', 'MULTI_PLAYER');

-- CreateEnum
CREATE TYPE "GameDevice" AS ENUM ('DESKTOP', 'MOBILE');

-- AlterEnum
BEGIN;
CREATE TYPE "GameStatus_new" AS ENUM ('STARTED', 'FINISHED');
ALTER TABLE "Game" ALTER COLUMN "status" TYPE "GameStatus_new" USING ("status"::text::"GameStatus_new");
ALTER TYPE "GameStatus" RENAME TO "GameStatus_old";
ALTER TYPE "GameStatus_new" RENAME TO "GameStatus";
DROP TYPE "GameStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "endTime",
ADD COLUMN     "device" "GameDevice" NOT NULL,
ADD COLUMN     "duration" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "mode" "GameMode" NOT NULL,
DROP COLUMN "startTime",
ADD COLUMN     "startTime" DOUBLE PRECISION NOT NULL;
