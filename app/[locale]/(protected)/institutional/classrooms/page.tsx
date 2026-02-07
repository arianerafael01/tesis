import { prisma } from '@/lib/prisma'
import ClassroomsClient from '../classrooms-client'
import ClassroomsTable from './classrooms-table'

interface Classroom {
  id: string
  name: string
  classRoomType: string
  createdAt: Date
  courses: any[]
}

export default async function ClassroomsPage() {
  const classrooms = await prisma.classroom.findMany({
    include: {
      courses: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="space-y-6">
      <ClassroomsClient classrooms={classrooms} />
      <ClassroomsTable classrooms={classrooms} />
    </div>
  )
} 