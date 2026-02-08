-- AlterTable
ALTER TABLE "public"."teacher_availabilities" ADD COLUMN     "courseId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."teacher_availabilities" ADD CONSTRAINT "teacher_availabilities_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
