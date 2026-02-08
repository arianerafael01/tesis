import { prisma } from '@/lib/prisma'
import WeeklyScheduleClient from './weekly-schedule-client'

export default async function WeeklySchedulePage() {
  const teachers = await prisma.teacher.findMany({
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
          course: {
            include: {
              classroom: true
            }
          }
        }
      },
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
                  name: true,
                  classroom: {
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
      }
    },
    orderBy: {
      lastName: 'asc'
    }
  })

  return (
    <div className="space-y-6">
      <WeeklyScheduleClient teachers={teachers} />
    </div>
  )
}
