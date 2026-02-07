import { prisma } from '@/lib/prisma'
import SubjectsClient from '../subjects-client'
import SubjectsTable from './subjects-table'

interface Subject {
  id: string
  name: string
  courseId: string
  createdAt: Date
  course: {
    id: string
    name: string
  }
  subjectsTeachers: any[]
}

export default async function SubjectsPage() {
  const subjects = await prisma.subject.findMany({
    include: {
      course: true,
      subjectsTeachers: {
        include: {
          teacher: true
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
    <div className="space-y-6">
      <SubjectsClient subjects={subjects} courses={courses} />
      <SubjectsTable subjects={subjects} courses={courses} />
    </div>
  )
} 