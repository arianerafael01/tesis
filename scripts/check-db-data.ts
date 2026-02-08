import { prisma } from '../lib/prisma'

async function checkDatabaseData() {
  console.log('=== CHECKING DATABASE DATA ===\n')

  // 1. Check Teachers
  const teachers = await prisma.teacher.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      _count: {
        select: {
          subjectsTeachers: true,
          availabilities: true
        }
      }
    }
  })
  console.log('📚 TEACHERS:', teachers.length)
  teachers.forEach(t => {
    console.log(`  - ${t.firstName} ${t.lastName}`)
    console.log(`    Subjects: ${t._count.subjectsTeachers}, Availabilities: ${t._count.availabilities}`)
  })

  // 2. Check SubjectsTeacher
  console.log('\n📖 SUBJECTS ASSIGNED TO TEACHERS:')
  const subjectsTeachers = await prisma.subjectsTeacher.findMany({
    include: {
      teacher: { select: { firstName: true, lastName: true } },
      subject: { select: { name: true } },
      course: { select: { name: true } }
    }
  })
  console.log(`Total: ${subjectsTeachers.length}`)
  subjectsTeachers.forEach(st => {
    console.log(`  - ${st.teacher.firstName} ${st.teacher.lastName}: ${st.subject.name} (${st.course.name})`)
  })

  // 3. Check CourseSubject (modules configuration)
  console.log('\n🎓 COURSE-SUBJECT MODULE CONFIGURATION:')
  const courseSubjects = await prisma.courseSubject.findMany({
    include: {
      course: { select: { name: true } },
      subject: { select: { name: true } }
    }
  })
  console.log(`Total: ${courseSubjects.length}`)
  courseSubjects.forEach(cs => {
    console.log(`  - ${cs.subject.name} in ${cs.course.name}: ${cs.modules} modules`)
  })

  // 4. Check Availabilities
  console.log('\n⏰ TEACHER AVAILABILITIES:')
  const availabilities = await prisma.availability.findMany({
    include: {
      teacher: { select: { firstName: true, lastName: true } },
      teacherAvailabilities: true
    }
  })
  console.log(`Total: ${availabilities.length}`)
  availabilities.forEach(a => {
    console.log(`  - ${a.teacher.firstName} ${a.teacher.lastName} (${a.day}):`)
    console.log(`    Time ranges: ${a.timeRanges.length}`)
    console.log(`    Assigned slots: ${a.teacherAvailabilities.length}`)
  })

  // 5. Check TeacherAvailability (assigned slots)
  console.log('\n✅ ASSIGNED SLOTS:')
  const assignedSlots = await prisma.teacherAvailability.findMany({
    where: {
      subjectId: { not: null }
    },
    include: {
      subject: { select: { name: true } },
      course: { select: { name: true } },
      availability: {
        include: {
          teacher: { select: { firstName: true, lastName: true } }
        }
      }
    }
  })
  console.log(`Total: ${assignedSlots.length}`)
  assignedSlots.forEach(slot => {
    console.log(`  - ${slot.availability.teacher.firstName} ${slot.availability.teacher.lastName}: ${slot.subject?.name} (${slot.course?.name}) - ${slot.timeRange}`)
  })

  // 6. Summary for auto-assign
  console.log('\n📊 SUMMARY FOR AUTO-ASSIGN:')
  for (const teacher of teachers) {
    const teacherFull = await prisma.teacher.findUnique({
      where: { id: teacher.id },
      include: {
        subjectsTeachers: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                coursesSubjects: {
                  select: {
                    courseId: true,
                    modules: true
                  }
                }
              }
            },
            course: { select: { id: true, name: true } }
          }
        },
        availabilities: {
          include: {
            teacherAvailabilities: true
          }
        }
      }
    })

    if (!teacherFull) continue

    console.log(`\n${teacherFull.firstName} ${teacherFull.lastName}:`)
    
    // Calculate needs
    for (const st of teacherFull.subjectsTeachers) {
      const courseSubject = st.subject.coursesSubjects?.find(cs => cs.courseId === st.courseId)
      const requiredModules = courseSubject?.modules || 0
      
      const assignedModules = teacherFull.availabilities.reduce((sum, avail) => {
        return sum + avail.teacherAvailabilities.filter(ta => 
          ta.subjectId === st.subjectId && ta.courseId === st.courseId
        ).length
      }, 0)

      const availableSlots = teacherFull.availabilities.reduce((sum, avail) => {
        const unassigned = avail.timeRanges.filter(tr => 
          !avail.teacherAvailabilities.some(ta => ta.timeRange === tr)
        )
        return sum + unassigned.length
      }, 0)

      console.log(`  ${st.subject.name} (${st.course.name}):`)
      console.log(`    Required: ${requiredModules} modules`)
      console.log(`    Assigned: ${assignedModules} modules`)
      console.log(`    Remaining: ${requiredModules - assignedModules} modules`)
      console.log(`    Available slots: ${availableSlots}`)
    }
  }

  await prisma.$disconnect()
}

checkDatabaseData().catch(console.error)
