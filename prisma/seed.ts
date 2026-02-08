import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample classrooms
  const classroom1 = await prisma.classroom.create({
    data: {
      name: 'Aula 101',
      classRoomType: 'theoretical',
    },
  })

  const classroom2 = await prisma.classroom.create({
    data: {
      name: 'Taller 1',
      classRoomType: 'Workshop',
    },
  })

  const classroom3 = await prisma.classroom.create({
    data: {
      name: 'Laboratorio Informática',
      classRoomType: 'ComputerLab',
    },
  })

  const classroom4 = await prisma.classroom.create({
    data: {
      name: 'Gimnasio Principal',
      classRoomType: 'Gym',
    },
  })

  console.log('✅ Classrooms created')

  // Create sample courses
  const course1 = await prisma.course.create({
    data: {
      name: 'Primer Año',
      classRoomId: classroom1.id,
      shift: 'MorningShift',
      cycle: '2024',
    },
  })

  const course2 = await prisma.course.create({
    data: {
      name: 'Segundo Año',
      classRoomId: classroom1.id,
      shift: 'LateShift',
      cycle: '2024',
    },
  })

  const course3 = await prisma.course.create({
    data: {
      name: 'Tercer Año',
      classRoomId: classroom2.id,
      shift: 'MorningShift',
      cycle: '2024',
    },
  })

  console.log('✅ Courses created')

  // Create sample subjects (without course relation)
  const subject1 = await prisma.subject.create({
    data: {
      name: 'Matemáticas',
    },
  })

  const subject2 = await prisma.subject.create({
    data: {
      name: 'Historia',
    },
  })

  const subject3 = await prisma.subject.create({
    data: {
      name: 'Física',
    },
  })

  const subject4 = await prisma.subject.create({
    data: {
      name: 'Química',
    },
  })

  const subject5 = await prisma.subject.create({
    data: {
      name: 'Literatura',
    },
  })

  const subject6 = await prisma.subject.create({
    data: {
      name: 'Música',
    },
  })

  console.log('✅ Subjects created')

  // Create CourseSubject relationships with specific module counts
  await prisma.courseSubject.create({
    data: {
      courseId: course1.id,
      subjectId: subject1.id,
      modules: 5, // Matemáticas - 1er Año: 5 módulos
    },
  })

  await prisma.courseSubject.create({
    data: {
      courseId: course1.id,
      subjectId: subject2.id,
      modules: 3, // Historia - 1er Año: 3 módulos
    },
  })

  await prisma.courseSubject.create({
    data: {
      courseId: course1.id,
      subjectId: subject6.id,
      modules: 2, // Música - 1er Año: 2 módulos
    },
  })

  await prisma.courseSubject.create({
    data: {
      courseId: course2.id,
      subjectId: subject1.id,
      modules: 4, // Matemáticas - 2do Año: 4 módulos (misma materia, diferente curso)
    },
  })

  await prisma.courseSubject.create({
    data: {
      courseId: course2.id,
      subjectId: subject3.id,
      modules: 4, // Física - 2do Año: 4 módulos
    },
  })

  await prisma.courseSubject.create({
    data: {
      courseId: course2.id,
      subjectId: subject4.id,
      modules: 3, // Química - 2do Año: 3 módulos
    },
  })

  await prisma.courseSubject.create({
    data: {
      courseId: course3.id,
      subjectId: subject5.id,
      modules: 5, // Literatura - 3er Año: 5 módulos
    },
  })

  console.log('✅ Course-Subject relationships created')

  // Create sample teachers
  const teacher1 = await prisma.teacher.create({
    data: {
      firstName: 'Juan',
      lastName: 'Pérez',
      idNumber: '12345678',
      fileNumber: 'LEG001',
      birthdate: new Date('1980-05-15'),
      nationality: 'Argentina',
      address: 'Av. San Martín 123',
      neighborhood: 'Centro',
    },
  })

  const teacher2 = await prisma.teacher.create({
    data: {
      firstName: 'María',
      lastName: 'González',
      idNumber: '87654321',
      fileNumber: 'LEG002',
      birthdate: new Date('1985-08-20'),
      nationality: 'Argentina',
      address: 'Calle Belgrano 456',
      neighborhood: 'Norte',
    },
  })

  const teacher3 = await prisma.teacher.create({
    data: {
      firstName: 'Carlos',
      lastName: 'Rodríguez',
      idNumber: '11223344',
      fileNumber: 'LEG003',
      birthdate: new Date('1978-12-10'),
      nationality: 'Argentina',
      address: 'Ruta 9 Km 15',
      neighborhood: 'Sur',
    },
  })

  console.log('✅ Teachers created')

  // Create teacher-subject-course relationships
  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacher1.id,
      subjectId: subject1.id,
      courseId: course1.id, // Juan teaches Matemáticas to 1er Año (5 modules)
    },
  })

  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacher1.id,
      subjectId: subject3.id,
      courseId: course2.id, // Juan teaches Física to 2do Año (4 modules)
    },
  })

  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacher2.id,
      subjectId: subject2.id,
      courseId: course1.id, // María teaches Historia to 1er Año (3 modules)
    },
  })

  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacher2.id,
      subjectId: subject4.id,
      courseId: course2.id, // María teaches Química to 2do Año (3 modules)
    },
  })

  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacher2.id,
      subjectId: subject6.id,
      courseId: course1.id, // María teaches Música to 1er Año (2 modules)
    },
  })

  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacher3.id,
      subjectId: subject5.id,
      courseId: course3.id, // Carlos teaches Literatura to 3er Año (5 modules)
    },
  })

  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacher3.id,
      subjectId: subject1.id,
      courseId: course2.id, // Carlos also teaches Matemáticas to 2do Año (4 modules)
    },
  })

  console.log('✅ Teacher-Subject-Course relationships created')

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 