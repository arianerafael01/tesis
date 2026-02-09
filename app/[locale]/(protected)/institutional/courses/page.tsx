import { prisma } from '@/lib/prisma'
import CoursesClient from '../courses-client'
import CoursesTable from './courses-table'

interface Course {
  id: string
  name: string
  shift: string
  cycle: string
  classRoomId: string
  createdAt: Date
  classroom: {
    id: string
    name: string
  }
  subjects: any[]
}

export default async function CoursesPage() {
  const coursesData = await prisma.course.findMany({
    include: {
      classroom: true,
      coursesSubjects: {
        include: {
          subject: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const courses = coursesData.map(course => ({
    ...course,
    subjects: course.coursesSubjects
  }))

  const classrooms = await prisma.classroom.findMany({
    select: {
      id: true,
      name: true
    }
  })

  return (
    <div className="space-y-6">
      <CoursesClient courses={courses} classrooms={classrooms} />
      <CoursesTable courses={courses} classrooms={classrooms} />
    </div>
  )
} 