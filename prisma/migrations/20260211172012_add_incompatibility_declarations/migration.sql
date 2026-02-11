-- CreateTable
CREATE TABLE "public"."incompatibility_declarations" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "documentUrl" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incompatibility_declarations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."incompatibility_slots" (
    "id" TEXT NOT NULL,
    "declarationId" TEXT NOT NULL,
    "day" "public"."Day" NOT NULL,
    "timeRange" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incompatibility_slots_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."incompatibility_declarations" ADD CONSTRAINT "incompatibility_declarations_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."incompatibility_slots" ADD CONSTRAINT "incompatibility_slots_declarationId_fkey" FOREIGN KEY ("declarationId") REFERENCES "public"."incompatibility_declarations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
