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
              <TableHead>{t('courses')}</TableHead>
              <TableHead>{t('teachers')}</TableHead>
              <TableHead>{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell className="font-medium">{subject.name}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {subject.coursesSubjects.map((cs) => (
                      <Badge key={cs.courseId} color="secondary" className="text-xs">
                        {cs.course.name} ({cs.modules} mód.)
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {subject.subjectsTeachers.slice(0, 3).map((st, idx) => (
                      <Badge key={`${st.teacher.id}-${st.courseId}`} color="info" className="text-xs">
                        {st.teacher.firstName} {st.teacher.lastName} ({st.course.name})
                      </Badge>
                    ))}
                    {subject.subjectsTeachers.length > 3 && (
                      <Badge color="default" className="text-xs">
                        +{subject.subjectsTeachers.length - 3}
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