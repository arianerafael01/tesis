-- CreateTable
CREATE TABLE "public"."school_schedule_configs" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "shift" "public"."Shift" NOT NULL,
    "startTime" VARCHAR(10) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_schedule_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."schedule_modules" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "moduleNumber" INTEGER NOT NULL,
    "startTime" VARCHAR(10) NOT NULL,
    "endTime" VARCHAR(10) NOT NULL,

    CONSTRAINT "schedule_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."schedule_breaks" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "afterModule" INTEGER NOT NULL,
    "durationMinutes" INTEGER NOT NULL,

    CONSTRAINT "schedule_breaks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "schedule_modules_configId_moduleNumber_key" ON "public"."schedule_modules"("configId", "moduleNumber");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_breaks_configId_afterModule_key" ON "public"."schedule_breaks"("configId", "afterModule");

-- AddForeignKey
ALTER TABLE "public"."schedule_modules" ADD CONSTRAINT "schedule_modules_configId_fkey" FOREIGN KEY ("configId") REFERENCES "public"."school_schedule_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."schedule_breaks" ADD CONSTRAINT "schedule_breaks_configId_fkey" FOREIGN KEY ("configId") REFERENCES "public"."school_schedule_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
