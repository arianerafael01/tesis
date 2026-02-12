import { PrismaClient } from '../lib/generated/prisma';

const prisma = new PrismaClient();

async function applyPerformanceIndexes() {
  console.log('🚀 Aplicando índices de rendimiento...\n');

  try {
    // Teachers table indexes
    console.log('📊 Creando índices para teachers...');
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_teachers_created_at" ON "teachers"("createdAt" DESC)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_teachers_id_number" ON "teachers"("idNumber")`;

    // Students table indexes
    console.log('📊 Creando índices para students...');
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_students_course_id" ON "students"("courseId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_students_created_at" ON "students"("createdAt" DESC)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_students_id_number" ON "students"("idNumber")`;

    // SubjectsTeachers junction table indexes
    console.log('📊 Creando índices para subjects_teachers...');
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_subjects_teachers_teacher_id" ON "subjects_teachers"("teacherId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_subjects_teachers_subject_id" ON "subjects_teachers"("subjectId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_subjects_teachers_course_id" ON "subjects_teachers"("courseId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_subjects_teachers_lookup" ON "subjects_teachers"("teacherId", "subjectId", "courseId")`;

    // Availabilities table indexes
    console.log('📊 Creando índices para availabilities...');
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_availabilities_teacher_id" ON "availabilities"("teacherId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_availabilities_day" ON "availabilities"("day")`;

    // TeacherAvailabilities table indexes
    console.log('📊 Creando índices para teacher_availabilities...');
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_teacher_availabilities_availability_id" ON "teacher_availabilities"("availabilityId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_teacher_availabilities_subject_id" ON "teacher_availabilities"("subjectId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_teacher_availabilities_course_id" ON "teacher_availabilities"("courseId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_teacher_availabilities_lookup" ON "teacher_availabilities"("availabilityId", "subjectId", "courseId")`;

    // CourseSubjects junction table indexes
    console.log('📊 Creando índices para courses_subjects...');
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_courses_subjects_course_id" ON "courses_subjects"("courseId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_courses_subjects_subject_id" ON "courses_subjects"("subjectId")`;

    // Courses table indexes
    console.log('📊 Creando índices para courses...');
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_courses_classroom_id" ON "courses"("classRoomId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_courses_shift" ON "courses"("shift")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_courses_created_at" ON "courses"("createdAt" DESC)`;

    // Attendance tables indexes
    console.log('📊 Creando índices para teacher_attendances...');
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_teacher_attendances_teacher_id" ON "teacher_attendances"("teacherId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_teacher_attendances_date" ON "teacher_attendances"("date" DESC)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_teacher_attendances_status" ON "teacher_attendances"("status")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_attendances_date_status" ON "teacher_attendances"("date", "status")`;

    console.log('📊 Creando índices para student_attendances...');
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_student_attendances_student_id" ON "student_attendances"("studentId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_student_attendances_course_id" ON "student_attendances"("courseId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_student_attendances_date" ON "student_attendances"("date" DESC)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_student_attendances_status" ON "student_attendances"("status")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_student_attendances_date_status" ON "student_attendances"("date", "status")`;

    console.log('\n✅ Todos los índices han sido creados exitosamente!');
    console.log('📈 El rendimiento de las consultas debería mejorar significativamente.\n');

  } catch (error) {
    console.error('❌ Error al crear índices:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

applyPerformanceIndexes()
  .then(() => {
    console.log('🎉 Optimización completada!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
