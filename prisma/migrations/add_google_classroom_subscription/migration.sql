-- Add Google Classroom subscription field to users table
ALTER TABLE "users" ADD COLUMN "hasGoogleClassroomSubscription" BOOLEAN NOT NULL DEFAULT false;
