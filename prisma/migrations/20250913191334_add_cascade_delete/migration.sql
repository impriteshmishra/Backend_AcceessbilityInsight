-- DropForeignKey
ALTER TABLE "public"."scan_history" DROP CONSTRAINT "scan_history_userClerkId_fkey";

-- AddForeignKey
ALTER TABLE "public"."scan_history" ADD CONSTRAINT "scan_history_userClerkId_fkey" FOREIGN KEY ("userClerkId") REFERENCES "public"."users"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;
