import { prisma } from '@/lib/prisma'
import CourseScheduleClient from './course-schedule-client'
import { getCurrentUser } from '@/lib/permissions'
import { redirect } from 'next/navigation'

export default async function CourseSchedulePage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/es/auth/login')
  }
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
      <CourseScheduleClient courses={courses} teachers={teachers} userRole={user.role} />
    </div>
  )
}
