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
  coursesSubjects: {
    subject: {
      id: string
      name: string
    }
    modules: number
  }[]
}

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
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