'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import EditTeacherDialog from './edit-teacher-dialog'
import DeleteTeacherDialog from './delete-teacher-dialog'
import { IncompatibilityDeclarationDialog } from '@/components/teachers/incompatibility-declaration-dialog'
import { Icon } from '@iconify/react'

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
    subjectId: string
    courseId: string
    subject: {
      id: string
      name: string
      coursesSubjects: {
        courseId: string
        modules: number
      }[]
    }
    course: {
      id: string
      name: string
    }
  }[]
  availabilities: {
    id: string
    day: 'M' | 'T' | 'W' | 'TH' | 'F'
    timeRanges: string[]
    teacherAvailabilities: {
      id: string
      timeRange: string
      subjectId: string | null
      subject: {
        id: string
        name: string
      } | null
    }[]
  }[]
}

interface Subject {
  id: string
  name: string
  coursesSubjects: {
    courseId: string
    course: {
      id: string
      name: string
    }
  }[]
}

export default function TeachersTable({ teachers, availableSubjects }: { teachers: Teacher[], availableSubjects: Subject[] }) {
  const t = useTranslations('teachersPage')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)
  const [incompatibilityDialogOpen, setIncompatibilityDialogOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)

  const sortedTeachers = useMemo(() => {
    if (!sortOrder) return teachers
    return [...teachers].sort((a, b) => {
      const nameA = `${a.lastName} ${a.firstName}`.toLowerCase()
      const nameB = `${b.lastName} ${b.firstName}`.toLowerCase()
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
    })
  }, [teachers, sortOrder])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('teachersList')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none hover:text-foreground"
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              >
                {t('fullName')} {sortOrder === 'asc' ? '↑' : sortOrder === 'desc' ? '↓' : '↕'}
              </TableHead>
              <TableHead>{t('idNumber')}</TableHead>
              <TableHead>{t('fileNumber')}</TableHead>
              <TableHead>{t('nationality')}</TableHead>
              <TableHead>{t('neighborhood')}</TableHead>
              <TableHead>{t('subjects')}</TableHead>
              <TableHead>{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTeachers.map((teacher) => (
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
                      <Badge key={`${st.subjectId}-${st.courseId}`} color="default" className="text-xs">
                        {st.subject.name} ({st.course.name})
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
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSelectedTeacher(teacher)
                        setIncompatibilityDialogOpen(true)
                      }}
                      title="Declaración Jurada de Incompatibilidades"
                    >
                      <Icon icon="heroicons-outline:document-text" className="w-4 h-4" />
                    </Button>
                    <EditTeacherDialog teacher={teacher} availableSubjects={availableSubjects} />
                    <DeleteTeacherDialog teacherId={teacher.id} teacherName={`${teacher.firstName} ${teacher.lastName}`} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      {selectedTeacher && (
        <IncompatibilityDeclarationDialog
          teacherId={selectedTeacher.id}
          teacherName={`${selectedTeacher.firstName} ${selectedTeacher.lastName}`}
          teacherDNI={selectedTeacher.idNumber}
          teacherFirstName={selectedTeacher.firstName}
          teacherLastName={selectedTeacher.lastName}
          open={incompatibilityDialogOpen}
          onOpenChange={setIncompatibilityDialogOpen}
        />
      )}
    </Card>
  )
} 