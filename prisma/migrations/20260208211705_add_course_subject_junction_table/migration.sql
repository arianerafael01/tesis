-- CreateEnum
CREATE TYPE "public"."ClassRoomType" AS ENUM ('theoretical', 'Workshop', 'ComputerLab', 'Gym');

-- CreateEnum
CREATE TYPE "public"."Shift" AS ENUM ('MorningShift', 'LateShift');

-- CreateEnum
CREATE TYPE "public"."Day" AS ENUM ('M', 'T', 'W', 'TH', 'F');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."teachers" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "idNumber" VARCHAR(20) NOT NULL,
    "fileNumber" VARCHAR(40) NOT NULL,
    "birthdate" TIMESTAMP(3) NOT NULL,
    "nationality" VARCHAR(40) NOT NULL,
    "address" VARCHAR(100) NOT NULL,
    "neighborhood" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subjects" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(40) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."courses_subjects" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "modules" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subjects_teachers" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjects_teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."classrooms" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(40) NOT NULL,
    "classRoomType" "public"."ClassRoomType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classrooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."courses" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "shift" "public"."Shift" NOT NULL,
    "cycle" VARCHAR(5) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "classRoomId" TEXT NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."availabilities" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "day" "public"."Day" NOT NULL,
    "timeRanges" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."teacher_availabilities" (
    "id" TEXT NOT NULL,
    "availabilityId" TEXT NOT NULL,
    "timeRange" TEXT NOT NULL,
    "subjectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_idNumber_key" ON "public"."teachers"("idNumber");

-- CreateIndex
CREATE UNIQUE INDEX "courses_subjects_courseId_subjectId_key" ON "public"."courses_subjects"("courseId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_teachers_teacherId_subjectId_courseId_key" ON "public"."subjects_teachers"("teacherId", "subjectId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "availabilities_teacherId_day_key" ON "public"."availabilities"("teacherId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_availabilities_availabilityId_timeRange_key" ON "public"."teacher_availabilities"("availabilityId", "timeRange");

-- AddForeignKey
ALTER TABLE "public"."courses_subjects" ADD CONSTRAINT "courses_subjects_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."courses_subjects" ADD CONSTRAINT "courses_subjects_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subjects_teachers" ADD CONSTRAINT "subjects_teachers_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subjects_teachers" ADD CONSTRAINT "subjects_teachers_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subjects_teachers" ADD CONSTRAINT "subjects_teachers_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."courses" ADD CONSTRAINT "courses_classRoomId_fkey" FOREIGN KEY ("classRoomId") REFERENCES "public"."classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."availabilities" ADD CONSTRAINT "availabilities_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher_availabilities" ADD CONSTRAINT "teacher_availabilities_availabilityId_fkey" FOREIGN KEY ("availabilityId") REFERENCES "public"."availabilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher_availabilities" ADD CONSTRAINT "teacher_availabilities_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
