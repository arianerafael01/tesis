import { prisma } from '@/lib/prisma'
import SubjectsClient from '../subjects-client'
import SubjectsTable from './subjects-table'
import { RoleGate } from '@/components/auth/role-gate'

interface Subject {
  id: string
  name: string
  createdAt: Date
  coursesSubjects: {
    courseId: string
    modules: number
    course: {
      id: string
      name: string
    }
  }[]
  subjectsTeachers: {
    courseId: string
    teacher: {
      id: string
      firstName: string
      lastName: string
    }
    course: {
      id: string
      name: string
    }
  }[]
}

export default async function SubjectsPage() {
  const subjects = await prisma.subject.findMany({
    include: {
      coursesSubjects: {
        include: {
          course: true
        }
      },
      subjectsTeachers: {
        include: {
          teacher: true,
          course: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const courses = await prisma.course.findMany({
    select: {
      id: true,
      name: true
    }
  })

  return (
    <RoleGate allowedRoles={["ADMIN"]}>
      <div className="space-y-6">
        <SubjectsClient subjects={subjects} courses={courses} />
        <SubjectsTable subjects={subjects} courses={courses} />
      </div>
    </RoleGate>
  )
} 