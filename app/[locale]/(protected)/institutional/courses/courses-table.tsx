'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'
import EditCourseDialog from './edit-course-dialog'
import DeleteCourseDialog from './delete-course-dialog'

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

interface Classroom {
  id: string
  name: string
}

export default function CoursesTable({ courses, classrooms }: { courses: Course[], classrooms: Classroom[] }) {
  const t = useTranslations('coursesPage')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('coursesList')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('shift')}</TableHead>
              <TableHead>{t('cycle')}</TableHead>
              <TableHead>{t('classroom')}</TableHead>
              <TableHead>{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">{course.name}</TableCell>
                <TableCell>
                  <Badge color="secondary">
                    {course.shift === 'MorningShift' ? 'Turno Mañana' : 'Turno Tarde'}
                  </Badge>
                </TableCell>
                <TableCell>{course.cycle}</TableCell>
                <TableCell>
                  <Badge color="info">{course.classroom.name}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <EditCourseDialog course={course} classrooms={classrooms} />
                    <DeleteCourseDialog courseId={course.id} courseName={course.name} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
} 