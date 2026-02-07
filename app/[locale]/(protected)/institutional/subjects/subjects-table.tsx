'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'
import EditSubjectDialog from './edit-subject-dialog'
import DeleteSubjectDialog from './delete-subject-dialog'

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

interface Course {
  id: string
  name: string
}

export default function SubjectsTable({ subjects, courses }: { subjects: Subject[], courses: Course[] }) {
  const t = useTranslations('subjectsPage')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('subjectsList')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('course')}</TableHead>
              <TableHead>{t('teachers')}</TableHead>
              <TableHead>{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell className="font-medium">{subject.name}</TableCell>
                <TableCell>
                  <Badge color="secondary">{subject.course.name}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {subject.subjectsTeachers.slice(0, 2).map((st: any) => (
                      <Badge key={st.teacher.id} color="info" className="text-xs">
                        {st.teacher.firstName} {st.teacher.lastName}
                      </Badge>
                    ))}
                    {subject.subjectsTeachers.length > 2 && (
                      <Badge color="default" className="text-xs">
                        +{subject.subjectsTeachers.length - 2} {t('more')}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <EditSubjectDialog subject={subject} courses={courses} />
                    <DeleteSubjectDialog subjectId={subject.id} subjectName={subject.name} />
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