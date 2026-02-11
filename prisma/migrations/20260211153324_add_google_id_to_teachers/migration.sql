/*
  Warnings:

  - A unique constraint covering the columns `[googleId]` on the table `teachers` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."teachers" ADD COLUMN     "googleId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "teachers_googleId_key" ON "public"."teachers"("googleId");
