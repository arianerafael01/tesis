import { prisma } from '@/lib/prisma'
import CourseScheduleClient from './course-schedule-client'

export default async function CourseSchedulePage() {
  const courses = await prisma.course.findMany({
    include: {
      classroom: true,
      coursesSubjects: {
        include: {
          subject: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })

  const teachers = await prisma.teacher.findMany({
    include: {
      availabilities: {
        include: {
          teacherAvailabilities: {
            include: {
              subject: {
                select: {
                  id: true,
                  name: true
                }
              },
              course: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      }
    }
  })

  return (
    <div className="space-y-6">
      <CourseScheduleClient courses={courses} teachers={teachers} />
    </div>
  )
}
