/*
  Warnings:

  - You are about to drop the column `image` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."users" DROP CONSTRAINT "users_teacherId_fkey";

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "image",
ALTER COLUMN "role" SET DEFAULT 'TEACHER';

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
