import { prisma } from '@/lib/prisma'
import WeeklyScheduleClient from './weekly-schedule-client'
import { getCurrentUser } from '@/lib/permissions'
import { redirect } from 'next/navigation'
import { getScheduleConfigs } from './schedule-config-actions'

export default async function WeeklySchedulePage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/es/auth/login')
  }

  const [teachers, scheduleConfigs] = await Promise.all([
    prisma.teacher.findMany({
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
  }),
    getScheduleConfigs(),
  ])

  return (
    <div className="space-y-6">
      <WeeklyScheduleClient teachers={teachers} userRole={user.role} scheduleConfigs={scheduleConfigs} />
    </div>
  )
}
