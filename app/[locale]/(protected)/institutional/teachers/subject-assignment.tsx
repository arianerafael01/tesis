'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Icon } from '@/components/ui/icon'
import { useTranslations } from 'next-intl'
import { assignSubjectToTeacher, removeSubjectFromTeacher } from './actions'

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

interface AssignedSubject {
  subjectId: string
  courseId: string
  subject: {
    id: string
    name: string
  }
  course: {
    id: string
    name: string
  }
}

interface Teacher {
  id: string
  firstName: string
  lastName: string
  subjectsTeachers: AssignedSubject[]
}

interface SubjectAssignmentProps {
  teacher: Teacher
  availableSubjects: Subject[]
}

export default function SubjectAssignment({ teacher, availableSubjects }: SubjectAssignmentProps) {
  const t = useTranslations('teachersPage')

  // Build list of assigned subject-course combinations
  const assignedCombinations = teacher.subjectsTeachers.map(st => `${st.subjectId}:${st.courseId}`)
  
  // Build list of available subject-course combinations that aren't assigned yet
  const availableCombinations = availableSubjects.flatMap(subject =>
    subject.coursesSubjects.map(cs => ({
      subjectId: subject.id,
      subjectName: subject.name,
      courseId: cs.courseId,
      courseName: cs.course.name,
      combinationKey: `${subject.id}:${cs.courseId}`
    }))
  ).filter(combo => !assignedCombinations.includes(combo.combinationKey))

  const handleAssignSubject = async (value: string) => {
    const [subjectId, courseId] = value.split(':')
    await assignSubjectToTeacher(teacher.id, subjectId, courseId)
  }

  const handleRemoveSubject = async (subjectId: string, courseId: string) => {
    await removeSubjectFromTeacher(teacher.id, subjectId, courseId)
  }

  return (
    <div className="space-y-6">
      {/* Assigned Subjects */}
      <Card>
        <CardHeader>
          <CardTitle>{t('assignedSubjects')}</CardTitle>
        </CardHeader>
        <CardContent>
          {teacher.subjectsTeachers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('name')}</TableHead>
                  <TableHead>{t('course')}</TableHead>
                  <TableHead>{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teacher.subjectsTeachers.map((st) => (
                  <TableRow key={`${st.subjectId}:${st.courseId}`}>
                    <TableCell className="font-medium">{st.subject.name}</TableCell>
                    <TableCell>
                      <Badge color="secondary">{st.course.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveSubject(st.subjectId, st.courseId)}
                      >
                        <Icon icon="heroicons-outline:minus" className="h-4 w-4" />
                        {t('removeSubject')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">{t('noSubjectsAssigned')}</p>
          )}
        </CardContent>
      </Card>

      {/* Available Subjects */}
      <Card>
        <CardHeader>
          <CardTitle>{t('availableSubjects')}</CardTitle>
        </CardHeader>
        <CardContent>
          {availableCombinations.length > 0 ? (
            <div className="space-y-4">
              <Select onValueChange={handleAssignSubject}>
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder={t('selectSubjectToAssign')} />
                </SelectTrigger>
                <SelectContent>
                  {availableCombinations.map((combo) => (
                    <SelectItem key={combo.combinationKey} value={combo.combinationKey}>
                      {combo.subjectName} - {combo.courseName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <p className="text-muted-foreground">{t('noSubjectsAvailable')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 