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

  const taller1 = await prisma.classroom.create({
    data: { name: 'Taller 1', classRoomType: 'Workshop' }
  })

  const labInfo = await prisma.classroom.create({
    data: { name: 'Laboratorio Informática', classRoomType: 'ComputerLab' }
  })

  console.log('✅ Classrooms created')

  // Create courses from images
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

  const teacherBodoira = await prisma.teacher.create({
    data: {
      firstName: 'M.',
      lastName: 'BODOIRA',
      idNumber: '30000001',
      fileNumber: '1001',
      birthdate: new Date('1980-01-01'),
      nationality: 'Argentina',
      address: 'Calle Falsa 123',
      neighborhood: 'Centro',
    }
  })

  const teacherSorbellini = await prisma.teacher.create({
    data: {
      firstName: 'Juan Ignacio',
      lastName: 'SORBELLINI',
      idNumber: '30000002',
      fileNumber: '1002',
      birthdate: new Date('1985-05-15'),
      nationality: 'Argentina',
      address: 'Av. Siempreviva 742',
      neighborhood: 'Norte',
    }
  })

  const teacherGomez = await prisma.teacher.create({
    data: {
      firstName: 'Zoe',
      lastName: 'GÓMEZ',
      idNumber: '30000003',
      fileNumber: '1003',
      birthdate: new Date('1990-03-20'),
      nationality: 'Argentina',
      address: 'Calle Principal 456',
      neighborhood: 'Sur',
    }
  })

  const teacherBilacio = await prisma.teacher.create({
    data: {
      firstName: 'Lucía',
      lastName: 'BILACIO',
      idNumber: '30000004',
      fileNumber: '1004',
      birthdate: new Date('1988-07-10'),
      nationality: 'Argentina',
      address: 'Pasaje Los Álamos 789',
      neighborhood: 'Este',
    }
  })

  const teacherDestefanis = await prisma.teacher.create({
    data: {
      firstName: 'Yanina',
      lastName: 'DESTEFANIS',
      idNumber: '30000005',
      fileNumber: '1005',
      birthdate: new Date('1992-11-25'),
      nationality: 'Argentina',
      address: 'Ruta 9 Km 5',
      neighborhood: 'Oeste',
    }
  })

  const teacherBocco = await prisma.teacher.create({
    data: {
      firstName: 'Marisa',
      lastName: 'BOCCO',
      idNumber: '30000006',
      fileNumber: '1006',
      birthdate: new Date('1987-09-18'),
      nationality: 'Argentina',
      address: 'Barrio Nuevo 321',
      neighborhood: 'Centro',
    }
  })

  const teacherCassini = await prisma.teacher.create({
    data: {
      firstName: 'Agustín',
      lastName: 'CASSINI',
      idNumber: '30000007',
      fileNumber: '1007',
      birthdate: new Date('1983-04-12'),
      nationality: 'Argentina',
      address: 'Calle Libertad 654',
      neighborhood: 'Norte',
    }
  })

  const teacherBejarano = await prisma.teacher.create({
    data: {
      firstName: 'Valentina',
      lastName: 'BEJARANO',
      idNumber: '30000008',
      fileNumber: '1008',
      birthdate: new Date('1991-06-30'),
      nationality: 'Argentina',
      address: 'Av. Independencia 987',
      neighborhood: 'Sur',
    }
  })

  const teacherTonioni = await prisma.teacher.create({
    data: {
      firstName: 'Carolina',
      lastName: 'TONIONI',
      idNumber: '30000009',
      fileNumber: '1009',
      birthdate: new Date('1989-12-05'),
      nationality: 'Argentina',
      address: 'Calle San Martín 147',
      neighborhood: 'Este',
    }
  })

  const teacherBonfitto = await prisma.teacher.create({
    data: {
      firstName: 'Mauro',
      lastName: 'BONFITTO',
      idNumber: '30000010',
      fileNumber: '1010',
      birthdate: new Date('1986-02-28'),
      nationality: 'Argentina',
      address: 'Pasaje Belgrano 258',
      neighborhood: 'Oeste',
    }
  })

  const teacherRomero = await prisma.teacher.create({
    data: {
      firstName: 'Cristian',
      lastName: 'ROMERO',
      idNumber: '30000011',
      fileNumber: '1011',
      birthdate: new Date('1984-08-14'),
      nationality: 'Argentina',
      address: 'Calle Mitre 369',
      neighborhood: 'Centro',
    }
  })

  const teacherMattius = await prisma.teacher.create({
    data: {
      firstName: 'Eugenio',
      lastName: 'MATTIUS',
      idNumber: '30000012',
      fileNumber: '1012',
      birthdate: new Date('1993-10-22'),
      nationality: 'Argentina',
      address: 'Av. Rivadavia 741',
      neighborhood: 'Norte',
    }
  })

  const teacherDalmira = await prisma.teacher.create({
    data: {
      firstName: 'Agustín',
      lastName: 'DALMIRA',
      idNumber: '30000013',
      fileNumber: '1013',
      birthdate: new Date('1990-01-17'),
      nationality: 'Argentina',
      address: 'Calle Sarmiento 852',
      neighborhood: 'Sur',
    }
  })

  const teacherFada = await prisma.teacher.create({
    data: {
      firstName: 'Federico',
      lastName: 'FADA',
      idNumber: '30000014',
      fileNumber: '1014',
      birthdate: new Date('1988-05-09'),
      nationality: 'Argentina',
      address: 'Pasaje Moreno 963',
      neighborhood: 'Este',
    }
  })

  const teacherCasas = await prisma.teacher.create({
    data: {
      firstName: 'Ignacio',
      lastName: 'CASAS',
      idNumber: '30000015',
      fileNumber: '1015',
      birthdate: new Date('1992-03-11'),
      nationality: 'Argentina',
      address: 'Calle Alem 159',
      neighborhood: 'Oeste',
    }
  })

  const teacherOlmos = await prisma.teacher.create({
    data: {
      firstName: 'Myriam',
      lastName: 'OLMOS',
      idNumber: '30000016',
      fileNumber: '1016',
      birthdate: new Date('1987-07-23'),
      nationality: 'Argentina',
      address: 'Av. Colón 357',
      neighborhood: 'Centro',
    }
  })

  const teacherKantor = await prisma.teacher.create({
    data: {
      firstName: 'Marcos',
      lastName: 'KANTOR',
      idNumber: '30000017',
      fileNumber: '1017',
      birthdate: new Date('1985-11-08'),
      nationality: 'Argentina',
      address: 'Calle Urquiza 468',
      neighborhood: 'Norte',
    }
  })

  const teacherLambertucci = await prisma.teacher.create({
    data: {
      firstName: 'Sup. LÓPEZ Hugo',
      lastName: 'LAMBERTUCCI',
      idNumber: '30000018',
      fileNumber: '1018',
      birthdate: new Date('1983-09-19'),
      nationality: 'Argentina',
      address: 'Pasaje Roca 579',
      neighborhood: 'Sur',
    }
  })

  const teacherFerreyra = await prisma.teacher.create({
    data: {
      firstName: 'Daniel',
      lastName: 'FERREYRA',
      idNumber: '30000019',
      fileNumber: '1019',
      birthdate: new Date('1991-04-27'),
      nationality: 'Argentina',
      address: 'Calle Irigoyen 681',
      neighborhood: 'Este',
    }
  })

  const teacherBarraza = await prisma.teacher.create({
    data: {
      firstName: 'Cecilia',
      lastName: 'BARRAZA',
      idNumber: '30000020',
      fileNumber: '1020',
      birthdate: new Date('1989-12-16'),
      nationality: 'Argentina',
      address: 'Av. Pellegrini 792',
      neighborhood: 'Oeste',
    }
  })

  const teacherAnula = await prisma.teacher.create({
    data: {
      firstName: 'Jorge',
      lastName: 'ANULA',
      idNumber: '30000021',
      fileNumber: '1021',
      birthdate: new Date('1986-06-03'),
      nationality: 'Argentina',
      address: 'Calle Paz 893',
      neighborhood: 'Centro',
    }
  })

  const teacherBellacrta = await prisma.teacher.create({
    data: {
      firstName: 'Eugenio',
      lastName: 'BELLACRTA',
      idNumber: '30000022',
      fileNumber: '1022',
      birthdate: new Date('1984-02-14'),
      nationality: 'Argentina',
      address: 'Pasaje Jujuy 147',
      neighborhood: 'Norte',
    }
  })

  console.log('✅ Teachers created')

  // Create users for teachers
  await prisma.user.create({
    data: {
      email: 'bodoira@instituto-etchegoyen.edu.ar',
      password: hashedPassword,
      name: 'M. BODOIRA',
      role: 'TEACHER',
      teacherId: teacherBodoira.id,
    }
  })

  await prisma.user.create({
    data: {
      email: 'sorbellini@instituto-etchegoyen.edu.ar',
      password: hashedPassword,
      name: 'Juan Ignacio SORBELLINI',
      role: 'TEACHER',
      teacherId: teacherSorbellini.id,
    }
  })

  await prisma.user.create({
    data: {
      email: 'gomez@instituto-etchegoyen.edu.ar',
      password: hashedPassword,
      name: 'Zoe GÓMEZ',
      role: 'TEACHER',
      teacherId: teacherGomez.id,
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

  // Assign subjects to teachers (SubjectsTeachers) - Examples from images
  // 2°A - BODOIRA teaches Historia
  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacherBodoira.id,
      subjectId: cienciasSociales.id,
      courseId: curso2A.id,
    }
  })

  // 2°A - SORBELLINI teaches Matemática
  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacherSorbellini.id,
      subjectId: matematica.id,
      courseId: curso2A.id,
    }
  })

  // 2°A - GÓMEZ teaches Lengua Extranjera
  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacherGomez.id,
      subjectId: lenguaExtranjera.id,
      courseId: curso2A.id,
    }
  })

  // 2°A - BILACIO teaches Biología
  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacherBilacio.id,
      subjectId: cienciasNaturales.id,
      courseId: curso2A.id,
    }
  })

  // 2°A - DESTEFANIS teaches Lengua y Literatura
  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacherDestefanis.id,
      subjectId: lengua.id,
      courseId: curso2A.id,
    }
  })

  // 2°A - CASSINI teaches Química
  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacherCassini.id,
      subjectId: cienciasNaturalesQuimica.id,
      courseId: curso2A.id,
    }
  })

  // 2°A - BOCCO teaches Educación Tecnológica
  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacherBocco.id,
      subjectId: edTecnologica.id,
      courseId: curso2A.id,
    }
  })

  // 5°U - BONFITTO teaches Psicología
  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacherBonfitto.id,
      subjectId: psicologia.id,
      courseId: curso5U.id,
    }
  })

  // 5°U - KANTOR teaches Física
  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacherKantor.id,
      subjectId: fisica.id,
      courseId: curso5U.id,
    }
  })

  // 5°U - ROMERO teaches Construcciones II
  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacherRomero.id,
      subjectId: construcciones.id,
      courseId: curso5U.id,
    }
  })

  // 6°U - MATTIUS teaches Economía y Gestión
  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacherMattius.id,
      subjectId: economiaGestion.id,
      courseId: curso6U.id,
    }
  })

  // 6°U - ROMERO teaches Topografía II
  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacherRomero.id,
      subjectId: topografiaII.id,
      courseId: curso6U.id,
    }
  })

  // 7°U - DALMIRA teaches Proyecto III
  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacherDalmira.id,
      subjectId: proyectoIII.id,
      courseId: curso7U.id,
    }
  })

  // 7°U - FADA teaches Estructuras III
  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacherFada.id,
      subjectId: estructurasIII.id,
      courseId: curso7U.id,
    }
  })

  // 7°U - CASAS teaches Administración y Conducción de Obra
  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacherCasas.id,
      subjectId: administracion.id,
      courseId: curso7U.id,
    }
  })

  // 7°U - CASAS teaches Emprendimientos
  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacherCasas.id,
      subjectId: emprendimientos.id,
      courseId: curso7U.id,
    }
  })

  // 4°U - BODOIRA teaches Historia/Geografía
  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacherBodoira.id,
      subjectId: historia.id,
      courseId: curso4U.id,
    }
  })

  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacherBodoira.id,
      subjectId: geografia.id,
      courseId: curso4U.id,
    }
  })

  // 4°U - BEJARANO teaches Biología
  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacherBejarano.id,
      subjectId: biologia.id,
      courseId: curso4U.id,
    }
  })

  // 4°U - DESTEFANIS teaches Lengua y Literatura
  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacherDestefanis.id,
      subjectId: lengua.id,
      courseId: curso4U.id,
    }
  })

  // 4°U - FADA teaches Instalaciones Eléctricas
  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacherFada.id,
      subjectId: instalacionesElectricas.id,
      courseId: curso4U.id,
    }
  })

  // 4°U - FADA teaches Estática y Resistencia de Materiales
  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacherFada.id,
      subjectId: estaticaResistencia.id,
      courseId: curso4U.id,
    }
  })

  // 4°U - LAMBERTUCCI teaches Sistema de Representación
  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacherLambertucci.id,
      subjectId: sistemaRepresentacion.id,
      courseId: curso4U.id,
    }
  })

  // 4°U - FERREYRA teaches Química
  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacherFerreyra.id,
      subjectId: quimica.id,
      courseId: curso4U.id,
    }
  })

  // 4°U - OLMOS teaches Matemática
  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacherOlmos.id,
      subjectId: matematica.id,
      courseId: curso4U.id,
    }
  })

  // 4°U - KANTOR teaches Física
  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacherKantor.id,
      subjectId: fisica.id,
      courseId: curso4U.id,
    }
  })

  // 4°U - BARRAZA teaches Inglés
  await prisma.subjectsTeacher.create({
    data: {
      teacherId: teacherBarraza.id,
      subjectId: ingles.id,
      courseId: curso4U.id,
    }
  })

  console.log('✅ Teacher-Subject assignments created')

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
