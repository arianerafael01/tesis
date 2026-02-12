import { prisma } from '@/lib/prisma'
import TeachersClient from '../teachers-client'
import TeachersTable from './teachers-table'
import { GoogleClassroomSync } from '@/components/google-classroom-sync'
import { auth } from '@/lib/auth'
import { hasGoogleClassroomAccess } from '@/lib/subscription'

interface Teacher {
  id: string
  firstName: string
  lastName: string
  idNumber: string
  fileNumber: string
  birthdate: Date
  nationality: string
  address: string
  neighborhood: string
  createdAt: Date
  subjectsTeachers: any[]
  availabilities: {
    id: string
    day: 'M' | 'T' | 'W' | 'TH' | 'F'
    timeRanges: string[]
    teacherAvailabilities: {
      id: string
      timeRange: string
      subjectId: string | null
      subject: {
        id: string
        name: string
      } | null
    }[]
  }[]
}

export default async function TeachersPage() {
  const session = await auth()
  const hasSubscription = session?.user ? hasGoogleClassroomAccess(session.user) : false
  
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
            select: {
              id: true,
              name: true
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
              }
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const availableSubjects = await prisma.subject.findMany({
    include: {
      coursesSubjects: {
        include: {
          course: {
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

  return (
    <div className="space-y-6">
      <GoogleClassroomSync hasSubscription={hasSubscription} />
      <TeachersClient teachers={teachers} />
      <TeachersTable teachers={teachers} availableSubjects={availableSubjects} />
    </div>
  )
} 