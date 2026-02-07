import { prisma } from '@/lib/prisma'
import TeachersClient from '../teachers-client'
import TeachersTable from './teachers-table'

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
  }[]
}

export default async function TeachersPage() {
  const teachers = await prisma.teacher.findMany({
    include: {
      subjectsTeachers: {
        include: {
          subject: {
            include: {
              course: true
            }
          }
        }
      },
      availabilities: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const availableSubjects = await prisma.subject.findMany({
    include: {
      course: true
    },
    orderBy: {
      name: 'asc'
    }
  })

  return (
    <div className="space-y-6">
      <TeachersClient teachers={teachers} />
      <TeachersTable teachers={teachers} availableSubjects={availableSubjects} />
    </div>
  )
} 