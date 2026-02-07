'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'
import EditTeacherDialog from './edit-teacher-dialog'
import DeleteTeacherDialog from './delete-teacher-dialog'

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
  subjectsTeachers: {
    subject: {
      id: string
      name: string
      course: {
        id: string
        name: string
      }
    }
  }[]
  availabilities: {
    id: string
    day: 'M' | 'T' | 'W' | 'TH' | 'F'
    timeRanges: string[]
  }[]
}

interface Subject {
  id: string
  name: string
  course: {
    id: string
    name: string
  }
}

export default function TeachersTable({ teachers, availableSubjects }: { teachers: Teacher[], availableSubjects: Subject[] }) {
  const t = useTranslations('teachersPage')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('teachersList')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('fullName')}</TableHead>
              <TableHead>{t('idNumber')}</TableHead>
              <TableHead>{t('fileNumber')}</TableHead>
              <TableHead>{t('nationality')}</TableHead>
              <TableHead>{t('neighborhood')}</TableHead>
              <TableHead>{t('subjects')}</TableHead>
              <TableHead>{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.map((teacher) => (
              <TableRow key={teacher.id}>
                <TableCell className="font-medium">
                  {teacher.firstName} {teacher.lastName}
                </TableCell>
                <TableCell>{teacher.idNumber}</TableCell>
                <TableCell>{teacher.fileNumber}</TableCell>
                <TableCell>
                  <Badge color="secondary">{teacher.nationality}</Badge>
                </TableCell>
                <TableCell>{teacher.neighborhood}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {teacher.subjectsTeachers.slice(0, 2).map((st) => (
                      <Badge key={st.subject.id} color="default" className="text-xs">
                        {st.subject.name}
                      </Badge>
                    ))}
                    {teacher.subjectsTeachers.length > 2 && (
                      <Badge color="default" className="text-xs">
                        +{teacher.subjectsTeachers.length - 2} {t('more')}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <EditTeacherDialog teacher={teacher} availableSubjects={availableSubjects} />
                    <DeleteTeacherDialog teacherId={teacher.id} teacherName={`${teacher.firstName} ${teacher.lastName}`} />
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