import { prisma } from '@/lib/prisma'
import WeeklyScheduleClient from './weekly-schedule-client'

export default async function WeeklySchedulePage() {
  const teachers = await prisma.teacher.findMany({
    include: {
      subjectsTeachers: {
        include: {
          subject: {
            include: {
              course: {
                include: {
                  classroom: true
                }
              }
            }
          }
        }
      },
      availabilities: true
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
