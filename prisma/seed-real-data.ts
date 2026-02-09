import { PrismaClient } from '../lib/generated/prisma'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with real schedule data...')

  // Clear existing data
  await prisma.teacherAvailability.deleteMany()
  await prisma.availability.deleteMany()
  await prisma.subjectsTeacher.deleteMany()
  await prisma.courseSubject.deleteMany()
  await prisma.user.deleteMany()
  await prisma.teacher.deleteMany()
  await prisma.subject.deleteMany()
  await prisma.course.deleteMany()
  await prisma.classroom.deleteMany()

  console.log('✅ Cleared existing data')

  // Create classrooms
  const aula101 = await prisma.classroom.create({
    data: { name: 'Aula 101', classRoomType: 'theoretical' }
  })

  const aula102 = await prisma.classroom.create({
    data: { name: 'Aula 102', classRoomType: 'theoretical' }
  })

  const aula103 = await prisma.classroom.create({
    data: { name: 'Aula 103', classRoomType: 'theoretical' }
  })

  const aula104 = await prisma.classroom.create({
    data: { name: 'Aula 104', classRoomType: 'theoretical' }
  })

  const aula105 = await prisma.classroom.create({
    data: { name: 'Aula 105', classRoomType: 'theoretical' }
  })

  const aula106 = await prisma.classroom.create({
    data: { name: 'Aula 106', classRoomType: 'theoretical' }
  })

  const taller1 = await prisma.classroom.create({
    data: { name: 'Taller de Construcciones', classRoomType: 'Workshop' }
  })

  const gimnasio = await prisma.classroom.create({
    data: { name: 'Gimnasio', classRoomType: 'Gym' }
  })

  const labInfo = await prisma.classroom.create({
    data: { name: 'Laboratorio de Informática', classRoomType: 'ComputerLab' }
  })

  console.log('✅ Classrooms created')

  // Create courses from images
  const curso1A = await prisma.course.create({
    data: {
      name: '1°A',
      classRoomId: aula103.id,
      shift: 'MorningShift',
      cycle: '2025',
    }
  })

  const curso1B = await prisma.course.create({
    data: {
      name: '1°B',
      classRoomId: aula104.id,
      shift: 'MorningShift',
      cycle: '2025',
    }
  })

  const curso2A = await prisma.course.create({
    data: {
      name: '2°A',
      classRoomId: aula101.id,
      shift: 'MorningShift',
      cycle: '2025',
    }
  })

  const curso2B = await prisma.course.create({
    data: {
      name: '2°B',
      classRoomId: aula102.id,
      shift: 'MorningShift',
      cycle: '2025',
    }
  })

  const curso3A = await prisma.course.create({
    data: {
      name: '3°A',
      classRoomId: aula105.id,
      shift: 'MorningShift',
      cycle: '2025',
    }
  })

  const curso4U = await prisma.course.create({
    data: {
      name: '4°U',
      classRoomId: aula101.id,
      shift: 'LateShift',
      cycle: '2025',
    }
  })

  const curso5U = await prisma.course.create({
    data: {
      name: '5°U',
      classRoomId: aula102.id,
      shift: 'LateShift',
      cycle: '2025',
    }
  })

  const curso6U = await prisma.course.create({
    data: {
      name: '6°U',
      classRoomId: taller1.id,
      shift: 'LateShift',
      cycle: '2025',
    }
  })

  const curso7U = await prisma.course.create({
    data: {
      name: '7°U',
      classRoomId: labInfo.id,
      shift: 'LateShift',
      cycle: '2025',
    }
  })

  console.log('✅ Courses created')

  // Create subjects from images
  const matematica = await prisma.subject.create({ data: { name: 'Matemática' } })
  const lengua = await prisma.subject.create({ data: { name: 'Lengua y Literatura' } })
  const historia = await prisma.subject.create({ data: { name: 'Historia' } })
  const geografia = await prisma.subject.create({ data: { name: 'Geografía' } })
  const biologia = await prisma.subject.create({ data: { name: 'Biología' } })
  const fisica = await prisma.subject.create({ data: { name: 'Física' } })
  const quimica = await prisma.subject.create({ data: { name: 'Química' } })
  const ingles = await prisma.subject.create({ data: { name: 'Inglés' } })
  const edFisica = await prisma.subject.create({ data: { name: 'Educación Física' } })
  const edArtistica = await prisma.subject.create({ data: { name: 'Educación Artística: Artes Visuales' } })
  const edTecnologica = await prisma.subject.create({ data: { name: 'Educación Tecnológica' } })
  const ciudadania = await prisma.subject.create({ data: { name: 'Ciudadanía y Participación' } })
  const cienciasSociales = await prisma.subject.create({ data: { name: 'Ciencias Sociales: Historia' } })
  const cienciasNaturales = await prisma.subject.create({ data: { name: 'Ciencias Naturales: Biología' } })
  const cienciasNaturalesQuimica = await prisma.subject.create({ data: { name: 'Ciencias Naturales: Química' } })
  const lenguaExtranjera = await prisma.subject.create({ data: { name: 'Lengua Extranjera: Inglés' } })
  const dibujoTecnico = await prisma.subject.create({ data: { name: 'Dibujo Técnico (UTP)' } })
  const psicologia = await prisma.subject.create({ data: { name: 'Psicología' } })
  const construcciones = await prisma.subject.create({ data: { name: 'Construcciones II' } })
  const estructuras = await prisma.subject.create({ data: { name: 'Estructuras I' } })
  const instalaciones = await prisma.subject.create({ data: { name: 'Instalaciones Sanitarias' } })
  const topografia = await prisma.subject.create({ data: { name: 'Topografía I' } })
  const proyecto = await prisma.subject.create({ data: { name: 'Proyecto I' } })
  const filosofia = await prisma.subject.create({ data: { name: 'Filosofía' } })
  const edArtisticaMusica = await prisma.subject.create({ data: { name: 'Ed. Artística: Música' } })
  const edArtisticaTeatro = await prisma.subject.create({ data: { name: 'Ed. Artística: Teatro' } })
  const analisisMatematico = await prisma.subject.create({ data: { name: 'Análisis Matemático' } })
  const proyectoII = await prisma.subject.create({ data: { name: 'Proyecto II' } })
  const proyectoIII = await prisma.subject.create({ data: { name: 'Proyecto III' } })
  const estructurasII = await prisma.subject.create({ data: { name: 'Estructuras II' } })
  const estructurasIII = await prisma.subject.create({ data: { name: 'Estructuras III' } })
  const administracion = await prisma.subject.create({ data: { name: 'Administración y Conducción de Obra' } })
  const asesoramiento = await prisma.subject.create({ data: { name: 'Asesoramiento Técnico' } })
  const emprendimientos = await prisma.subject.create({ data: { name: 'Emprendimientos' } })
  const higiene = await prisma.subject.create({ data: { name: 'Higiene y Seg. Laboral' } })
  const simbologia = await prisma.subject.create({ data: { name: 'T.I.F. / Simbología' } })
  const tif = await prisma.subject.create({ data: { name: 'T.I.F.' } })
  const marcoJuridico = await prisma.subject.create({ data: { name: 'Marco Jurídico de la Construcción' } })
  const ingles6 = await prisma.subject.create({ data: { name: 'Inglés Técnico' } })
  const sismologia = await prisma.subject.create({ data: { name: 'Sismología' } })
  const instalacionesElectricas = await prisma.subject.create({ data: { name: 'Instalaciones Eléctricas' } })
  const materialesConstruccion = await prisma.subject.create({ data: { name: 'Materiales para la Construcción' } })
  const sistemaRepresentacion = await prisma.subject.create({ data: { name: 'Sistema de Representación' } })
  const estaticaResistencia = await prisma.subject.create({ data: { name: 'Estática y Resistencia de los Materiales' } })
  const economiaGestion = await prisma.subject.create({ data: { name: 'Economía y Gestión de las Organizaciones' } })
  const topografiaII = await prisma.subject.create({ data: { name: 'Topografía II' } })

  console.log('✅ Subjects created')

  // Link subjects to courses (CourseSubject) - 1°A
  await prisma.courseSubject.create({ data: { courseId: curso1A.id, subjectId: matematica.id, modules: 4 } })
  await prisma.courseSubject.create({ data: { courseId: curso1A.id, subjectId: lengua.id, modules: 4 } })
  await prisma.courseSubject.create({ data: { courseId: curso1A.id, subjectId: cienciasSociales.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso1A.id, subjectId: cienciasNaturales.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso1A.id, subjectId: cienciasNaturalesQuimica.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso1A.id, subjectId: lenguaExtranjera.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso1A.id, subjectId: edTecnologica.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso1A.id, subjectId: edArtistica.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso1A.id, subjectId: edFisica.id, modules: 2 } })

  // 1°B
  await prisma.courseSubject.create({ data: { courseId: curso1B.id, subjectId: matematica.id, modules: 4 } })
  await prisma.courseSubject.create({ data: { courseId: curso1B.id, subjectId: lengua.id, modules: 4 } })
  await prisma.courseSubject.create({ data: { courseId: curso1B.id, subjectId: cienciasSociales.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso1B.id, subjectId: cienciasNaturales.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso1B.id, subjectId: cienciasNaturalesQuimica.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso1B.id, subjectId: lenguaExtranjera.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso1B.id, subjectId: edTecnologica.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso1B.id, subjectId: edArtistica.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso1B.id, subjectId: edFisica.id, modules: 2 } })

  // Link subjects to courses (CourseSubject) - 2°A
  await prisma.courseSubject.create({ data: { courseId: curso2A.id, subjectId: matematica.id, modules: 4 } })
  await prisma.courseSubject.create({ data: { courseId: curso2A.id, subjectId: lengua.id, modules: 4 } })
  await prisma.courseSubject.create({ data: { courseId: curso2A.id, subjectId: cienciasSociales.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso2A.id, subjectId: cienciasNaturales.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso2A.id, subjectId: cienciasNaturalesQuimica.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso2A.id, subjectId: lenguaExtranjera.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso2A.id, subjectId: edTecnologica.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso2A.id, subjectId: edArtistica.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso2A.id, subjectId: ciudadania.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso2A.id, subjectId: dibujoTecnico.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso2A.id, subjectId: edFisica.id, modules: 2 } })

  // 2°B
  await prisma.courseSubject.create({ data: { courseId: curso2B.id, subjectId: matematica.id, modules: 4 } })
  await prisma.courseSubject.create({ data: { courseId: curso2B.id, subjectId: lengua.id, modules: 4 } })
  await prisma.courseSubject.create({ data: { courseId: curso2B.id, subjectId: cienciasSociales.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso2B.id, subjectId: cienciasNaturales.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso2B.id, subjectId: cienciasNaturalesQuimica.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso2B.id, subjectId: lenguaExtranjera.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso2B.id, subjectId: edTecnologica.id, modules: 2 } })

  // 3°A
  await prisma.courseSubject.create({ data: { courseId: curso3A.id, subjectId: matematica.id, modules: 4 } })
  await prisma.courseSubject.create({ data: { courseId: curso3A.id, subjectId: lengua.id, modules: 4 } })
  await prisma.courseSubject.create({ data: { courseId: curso3A.id, subjectId: historia.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso3A.id, subjectId: geografia.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso3A.id, subjectId: biologia.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso3A.id, subjectId: fisica.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso3A.id, subjectId: quimica.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso3A.id, subjectId: ingles.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso3A.id, subjectId: edTecnologica.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso3A.id, subjectId: edArtistica.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso3A.id, subjectId: edFisica.id, modules: 2 } })

  // 4°U
  await prisma.courseSubject.create({ data: { courseId: curso4U.id, subjectId: historia.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso4U.id, subjectId: geografia.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso4U.id, subjectId: biologia.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso4U.id, subjectId: lengua.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso4U.id, subjectId: instalacionesElectricas.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso4U.id, subjectId: edArtistica.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso4U.id, subjectId: materialesConstruccion.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso4U.id, subjectId: matematica.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso4U.id, subjectId: ingles.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso4U.id, subjectId: estaticaResistencia.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso4U.id, subjectId: sistemaRepresentacion.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso4U.id, subjectId: quimica.id, modules: 2 } })

  // 5°U
  await prisma.courseSubject.create({ data: { courseId: curso5U.id, subjectId: psicologia.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso5U.id, subjectId: fisica.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso5U.id, subjectId: construcciones.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso5U.id, subjectId: estructuras.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso5U.id, subjectId: proyecto.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso5U.id, subjectId: historia.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso5U.id, subjectId: geografia.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso5U.id, subjectId: instalaciones.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso5U.id, subjectId: edArtisticaMusica.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso5U.id, subjectId: topografia.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso5U.id, subjectId: matematica.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso5U.id, subjectId: lengua.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso5U.id, subjectId: quimica.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso5U.id, subjectId: ingles.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso5U.id, subjectId: edFisica.id, modules: 2 } })

  // 6°U
  await prisma.courseSubject.create({ data: { courseId: curso6U.id, subjectId: ciudadania.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso6U.id, subjectId: economiaGestion.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso6U.id, subjectId: topografiaII.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso6U.id, subjectId: filosofia.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso6U.id, subjectId: edArtisticaTeatro.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso6U.id, subjectId: analisisMatematico.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso6U.id, subjectId: lengua.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso6U.id, subjectId: proyectoII.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso6U.id, subjectId: estructurasII.id, modules: 3 } })

  // 7°U
  await prisma.courseSubject.create({ data: { courseId: curso7U.id, subjectId: proyectoIII.id, modules: 4 } })
  await prisma.courseSubject.create({ data: { courseId: curso7U.id, subjectId: estructurasIII.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso7U.id, subjectId: administracion.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso7U.id, subjectId: asesoramiento.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso7U.id, subjectId: tif.id, modules: 3 } })
  await prisma.courseSubject.create({ data: { courseId: curso7U.id, subjectId: simbologia.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso7U.id, subjectId: emprendimientos.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso7U.id, subjectId: higiene.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso7U.id, subjectId: marcoJuridico.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso7U.id, subjectId: ingles6.id, modules: 2 } })
  await prisma.courseSubject.create({ data: { courseId: curso7U.id, subjectId: sismologia.id, modules: 2 } })

  console.log('✅ Course-Subject relationships created')

  // Create teachers from images
  const hashedPassword = await bcrypt.hash('profesor123', 10)

  const teacherCoppie = await prisma.teacher.create({
    data: {
      firstName: 'Angeles',
      lastName: 'COPPIE',
      idNumber: '30000001',
      fileNumber: '1001',
      birthdate: new Date('1985-03-15'),
      nationality: 'Argentina',
      address: 'Calle Principal 123',
      neighborhood: 'Centro',
    }
  })

  console.log('✅ Teachers created')

  // Create users for teachers
  await prisma.user.create({
    data: {
      email: 'coppie@instituto-etchegoyen.edu.ar',
      password: hashedPassword,
      name: 'Angeles COPPIE',
      role: 'TEACHER',
      teacherId: teacherCoppie.id,
    }
  })

  // Admin user
  const hashedAdminPassword = await bcrypt.hash('institucion123', 10)
  await prisma.user.create({
    data: {
      email: 'admin@instituto-etchegoyen.edu.ar',
      password: hashedAdminPassword,
      name: 'Administrador',
      role: 'ADMIN',
    }
  })

  console.log('✅ Users created')

  // Assign subjects to teachers - Angeles Coppie teaches Matemática in 1°A, 1°B, and 3°A
  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacherCoppie.id,
      subjectId: matematica.id,
      courseId: curso1A.id,
    }
  })

  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacherCoppie.id,
      subjectId: matematica.id,
      courseId: curso1B.id,
    }
  })

  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacherCoppie.id,
      subjectId: matematica.id,
      courseId: curso3A.id,
    }
  })

  console.log('✅ Teacher-Subject assignments created')

  // Generate random availabilities for all teachers
  // Time slots for morning shift (TM): 8 modules
  const morningSlots = [
    'Módulo 1 (7:30-8:10)',
    'Módulo 2 (8:10-8:50)',
    'Módulo 3 (9:00-9:40)',
    'Módulo 4 (9:40-10:20)',
    'Módulo 5 (10:30-11:10)',
    'Módulo 6 (11:10-11:50)',
    'Módulo 7 (12:00-12:40)',
    'Módulo 8 (12:40-13:20)',
  ]

  // Time slots for afternoon shift (TT): 11 modules
  const afternoonSlots = [
    'Módulo 1 (12:00-12:40)',
    'Módulo 2 (12:40-13:20)',
    'Módulo 3 (13:20-14:10)',
    'Módulo 4 (14:10-14:50)',
    'Módulo 5 (15:00-15:40)',
    'Módulo 6 (15:40-16:20)',
    'Módulo 7 (16:30-17:10)',
    'Módulo 8 (17:10-17:50)',
    'Módulo 9 (18:00-18:40)',
    'Módulo 10 (18:40-19:20)',
    'Módulo 11 (19:30-20:10)',
  ]

  const days: Array<'M' | 'T' | 'W' | 'TH' | 'F'> = ['M', 'T', 'W', 'TH', 'F']

  // Helper function to shuffle array
  const shuffle = <T,>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Helper function to get random elements from array
  const getRandomElements = <T,>(array: T[], count: number): T[] => {
    return shuffle(array).slice(0, count)
  }

  // Get all teachers with their subject assignments
  const teachersWithAssignments = await prisma.teacher.findMany({
    include: {
      subjectsTeachers: {
        include: {
          course: {
            include: {
              coursesSubjects: {
                where: {
                  subjectId: {
                    in: await prisma.subjectsTeacher.findMany({
                      select: { subjectId: true }
                    }).then(results => results.map(r => r.subjectId))
                  }
                }
              }
            }
          }
        }
      }
    }
  })

  // Generate availabilities for each teacher
  for (const teacher of teachersWithAssignments) {
    if (teacher.subjectsTeachers.length === 0) continue

    // Calculate total modules needed
    let totalModulesNeeded = 0
    const teacherCourses = new Set<string>()
    
    for (const assignment of teacher.subjectsTeachers) {
      teacherCourses.add(assignment.courseId)
      const courseSubject = assignment.course.coursesSubjects.find(
        cs => cs.subjectId === assignment.subjectId
      )
      if (courseSubject) {
        totalModulesNeeded += courseSubject.modules
      }
    }

    // Determine if teacher works morning or afternoon shift based on courses
    const courses = await prisma.course.findMany({
      where: { id: { in: Array.from(teacherCourses) } }
    })
    
    const hasMorningCourses = courses.some(c => c.shift === 'MorningShift')
    const hasAfternoonCourses = courses.some(c => c.shift === 'LateShift')
    
    // Select appropriate time slots
    let availableSlots = hasMorningCourses && !hasAfternoonCourses 
      ? morningSlots 
      : hasAfternoonCourses && !hasMorningCourses
        ? afternoonSlots
        : [...morningSlots, ...afternoonSlots] // Both shifts

    // Add 20% more slots to ensure enough availability
    const slotsNeeded = Math.ceil(totalModulesNeeded * 1.2)
    
    // Distribute slots across random days
    const selectedDays = getRandomElements(days, Math.min(5, Math.ceil(slotsNeeded / 4)))
    
    for (const day of selectedDays) {
      const slotsPerDay = Math.ceil(slotsNeeded / selectedDays.length)
      const daySlots = getRandomElements(availableSlots, Math.min(slotsPerDay, availableSlots.length))
      
      if (daySlots.length === 0) continue

      // Create availability for this day
      const availability = await prisma.availability.create({
        data: {
          teacherId: teacher.id,
          day: day,
          timeRanges: daySlots
        }
      })

      // Create teacher availability entries (without subject assignment)
      for (const slot of daySlots) {
        await prisma.teacherAvailability.create({
          data: {
            availabilityId: availability.id,
            timeRange: slot,
            subjectId: null,
            courseId: null,
          }
        })
      }
    }

    console.log(`  ✓ Generated ${slotsNeeded} slots for ${teacher.firstName} ${teacher.lastName} (needs ${totalModulesNeeded} modules)`)
  }

  console.log('✅ Teacher availabilities created')

  console.log('🎉 Database seeded successfully with real data!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
