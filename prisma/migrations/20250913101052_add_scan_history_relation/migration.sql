/*
  Warnings:

  - You are about to drop the column `userId` on the `scan_history` table. All the data in the column will be lost.
  - Added the required column `userClerkId` to the `scan_history` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."scan_history" DROP CONSTRAINT "scan_history_userId_fkey";

-- AlterTable
ALTER TABLE "public"."scan_history" DROP COLUMN "userId",
ADD COLUMN     "userClerkId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."scan_history" ADD CONSTRAINT "scan_history_userClerkId_fkey" FOREIGN KEY ("userClerkId") REFERENCES "public"."users"("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE;
