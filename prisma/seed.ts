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

  // Create sample subjects
  const subject1 = await prisma.subject.create({
    data: {
      name: 'Matemáticas',
      courseId: course1.id,
    },
  })

  const subject2 = await prisma.subject.create({
    data: {
      name: 'Historia',
      courseId: course1.id,
    },
  })

  const subject3 = await prisma.subject.create({
    data: {
      name: 'Física',
      courseId: course2.id,
    },
  })

  const subject4 = await prisma.subject.create({
    data: {
      name: 'Química',
      courseId: course2.id,
    },
  })

  const subject5 = await prisma.subject.create({
    data: {
      name: 'Literatura',
      courseId: course3.id,
    },
  })

  console.log('✅ Subjects created')

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

  // Create teacher-subject relationships
  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacher1.id,
      subjectId: subject1.id,
    },
  })

  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacher1.id,
      subjectId: subject3.id,
    },
  })

  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacher2.id,
      subjectId: subject2.id,
    },
  })

  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacher2.id,
      subjectId: subject4.id,
    },
  })

  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacher3.id,
      subjectId: subject5.id,
    },
  })

  console.log('✅ Teacher-Subject relationships created')

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