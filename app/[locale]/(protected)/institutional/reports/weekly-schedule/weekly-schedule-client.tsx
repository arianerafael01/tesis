'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/components/navigation'
import { assignSubjectToTimeSlot } from '../../teachers/actions'
import { autoAssignAllTeachers, unassignAllSubjects } from './actions'
import { toast } from 'sonner'

interface Teacher {
  id: string
  firstName: string
  lastName: string
  subjectsTeachers: {
    subjectId: string
    courseId: string
    subject: {
      id: string
      name: string
      coursesSubjects?: {
        courseId: string
        modules: number
      }[]
    }
    course: {
      id: string
      name: string
      shift: string
      classroom: {
        id: string
        name: string
      }
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
      course: {
        id: string
        name: string
        classroom: {
          id: string
          name: string
        }
      } | null
    }[]
  }[]
}

const DAYS = [
  { value: 'M', label: 'Lunes' },
  { value: 'T', label: 'Martes' },
  { value: 'W', label: 'Miércoles' },
  { value: 'TH', label: 'Jueves' },
  { value: 'F', label: 'Viernes' },
] as const

const TIME_SLOTS = [
  'Módulo 1 (7:30-8:10)',
  'Módulo 2 (8:10-8:50)',
  'Módulo 3 (9:00-9:40)',
  'Módulo 4 (9:40-10:20)',
  'Módulo 5 (10:30-11:10)',
  'Módulo 6 (11:10-11:50)',
  'Módulo 7 (12:00-12:40)',
  'Módulo 8 (12:40-13:20)',
  'Módulo 9 (13:20-14:10)',
  'Módulo 10 (14:10-14:50)',
  'Módulo 11 (15:00-15:40)',
  'Módulo 12 (15:40-16:20)',
  'Módulo 13 (16:30-17:10)',
  'Módulo 14 (17:10-17:50)',
  'Módulo 15 (18:00-18:40)',
  'Módulo 16 (18:40-19:20)',
  'Módulo 17 (19:30-20:10)',
]

function getDayLabel(day: string) {
  return DAYS.find(d => d.value === day)?.label || day
}

export default function WeeklyScheduleClient({ teachers }: { teachers: Teacher[] }) {
  const t = useTranslations('weeklySchedulePage')
  const router = useRouter()
  const printRef = useRef<HTMLDivElement>(null)
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('all')
  const [isAutoAssigning, setIsAutoAssigning] = useState(false)

  const handlePrint = () => {
    if (!printRef.current) return
    const printContent = printRef.current.innerHTML
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${t('title')} - ${selectedTeacherId === 'all' ? t('allTeachers') : getTeacherName(selectedTeacherId)}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; font-size: 11px; }
            h2 { font-size: 18px; margin-bottom: 4px; }
            h3 { font-size: 14px; margin-bottom: 8px; color: #555; }
            .teacher-schedule { page-break-after: always; margin-bottom: 30px; }
            .teacher-schedule:last-child { page-break-after: auto; }
            .teacher-name { font-size: 16px; font-weight: bold; margin: 16px 0 8px 0; padding: 6px 10px; background: #f0f0f0; border-radius: 4px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
            th, td { border: 1px solid #ccc; padding: 4px 6px; text-align: center; vertical-align: top; font-size: 10px; }
            th { background: #e8e8e8; font-weight: bold; font-size: 11px; }
            .time-col { width: 90px; font-weight: 600; background: #f5f5f5; }
            .available { background: #dcfce7; }
            .subject-cell { background: #dbeafe; }
            .subject-name { font-weight: 600; font-size: 10px; }
            .course-name { font-size: 9px; color: #666; }
            .summary { margin-top: 8px; font-size: 11px; }
            .summary-item { display: inline-block; margin-right: 16px; }
            @media print { body { padding: 10px; } }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const getTeacherName = (id: string) => {
    const teacher = teachers.find(t => t.id === id)
    return teacher ? `${teacher.lastName}, ${teacher.firstName}` : ''
  }

  const filteredTeachers = selectedTeacherId === 'all'
    ? teachers
    : teachers.filter(t => t.id === selectedTeacherId)

  // Check if there are any teachers with availability
  const hasTeachersWithAvailability = teachers.some(teacher => 
    teacher.availabilities && teacher.availabilities.length > 0
  )

  // Build schedule data per teacher
  const getTeacherSchedule = (teacher: Teacher) => {
    const schedule: Record<string, Record<string, { available: boolean; subject: { name: string; course: string; classroom: string } | null }>> = {}

    for (const day of DAYS) {
      schedule[day.value] = {}
      for (const slot of TIME_SLOTS) {
        schedule[day.value][slot] = { available: false, subject: null }
      }
    }

    // Mark available slots and assigned subjects
    for (const avail of teacher.availabilities) {
      for (const timeRange of avail.timeRanges) {
        if (schedule[avail.day]?.[timeRange]) {
          schedule[avail.day][timeRange].available = true
          
          // Check if there's a subject assigned to this specific time slot
          const teacherAvail = avail.teacherAvailabilities.find(ta => ta.timeRange === timeRange)
          if (teacherAvail?.subject && teacherAvail?.course) {
            schedule[avail.day][timeRange].subject = {
              name: teacherAvail.subject.name,
              course: teacherAvail.course.name,
              classroom: teacherAvail.course.classroom?.name || '-',
            }
          }
        }
      }
    }

    return schedule
  }

  const getTotalAvailableHours = (teacher: Teacher) => {
    return teacher.availabilities.reduce((total, a) => total + a.timeRanges.length, 0)
  }

  // Helper function to count assigned modules per subject-course combination
  const getAssignedModulesCount = (teacher: Teacher, subjectId: string, courseId: string) => {
    let count = 0
    for (const avail of teacher.availabilities) {
      for (const ta of avail.teacherAvailabilities) {
        if (ta.subjectId === subjectId && ta.course?.id === courseId) {
          count++
        }
      }
    }
    return count
  }

  // Helper function to get required modules for a subject-course combination
  const getRequiredModules = (teacher: Teacher, subjectId: string, courseId: string) => {
    const st = teacher.subjectsTeachers.find(st => st.subjectId === subjectId && st.courseId === courseId)
    if (!st) return 0
    
    // Find the modules from coursesSubjects
    const courseSubject = st.subject.coursesSubjects?.find((cs: any) => cs.courseId === courseId)
    return courseSubject?.modules || 0
  }

  const handleSubjectAssign = async (teacherId: string, day: 'M' | 'T' | 'W' | 'TH' | 'F', timeRange: string, value: string | null) => {
    try {
      let subjectId: string | null = null
      let courseId: string | null = null
      
      if (value && value !== 'none') {
        const [sid, cid] = value.split(':')
        subjectId = sid
        courseId = cid
      }
      
      await assignSubjectToTimeSlot(teacherId, day, timeRange, subjectId, courseId)
      toast.success('Materia asignada correctamente')
      router.refresh()
    } catch (error: any) {
      console.error('Error assigning subject:', error)
      toast.error(error.message || 'Error al asignar la materia')
    }
  }

  const handleAutoAssignAll = async () => {
    setIsAutoAssigning(true)
    try {
      const result = await autoAssignAllTeachers()
      toast.success(result.message)
      router.refresh()
    } catch (error: any) {
      console.error('Error auto-assigning subjects:', error)
      toast.error(error.message || 'Error al asignar materias automáticamente')
    } finally {
      setIsAutoAssigning(false)
    }
  }

  const handleUnassignAll = async () => {
    if (!confirm('¿Estás seguro de que quieres desasignar todas las materias de todos los profesores? Esta acción no se puede deshacer.')) {
      return
    }
    
    try {
      const result = await unassignAllSubjects()
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
      router.refresh()
    } catch (error: any) {
      console.error('Error unassigning subjects:', error)
      toast.error(error.message || 'Error al desasignar materias')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleUnassignAll}
            disabled={!hasTeachersWithAvailability}
            color="destructive"
            className="gap-2"
          >
            <Icon icon="heroicons:x-circle" className="h-4 w-4" />
            {t('unassignAll')}
          </Button>
          <Button
            onClick={handleAutoAssignAll}
            disabled={isAutoAssigning || !hasTeachersWithAvailability}
            variant="default"
            className="gap-2"
          >
            <Icon icon="heroicons:sparkles" className="h-4 w-4" />
            {isAutoAssigning ? t('assigning') : t('autoAssign')}
          </Button>
          <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder={t('selectTeacher')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allTeachers')}</SelectItem>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.lastName}, {teacher.firstName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handlePrint} variant="outline">
            <Icon icon="heroicons-outline:printer" className="mr-2 h-4 w-4" />
            {t('print')}
          </Button>
        </div>
      </div>

      {/* Schedule Grid (visible on screen) */}
      {filteredTeachers.map((teacher) => {
        const schedule = getTeacherSchedule(teacher)
        const totalHours = getTotalAvailableHours(teacher)

        return (
          <Card key={teacher.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {teacher.lastName}, {teacher.firstName}
                  </CardTitle>
                  <div className="flex gap-2 mt-1">
                    <Badge color="info">{totalHours} {t('hoursAvailable')}</Badge>
                    <Badge color="secondary">{teacher.subjectsTeachers.length} {t('subjectsAssigned')}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="border border-default-200 bg-default-100 p-2 text-left font-semibold w-[100px]">
                        {t('time')}
                      </th>
                      {DAYS.map((day) => (
                        <th key={day.value} className="border border-default-200 bg-default-100 p-2 text-center font-semibold">
                          {day.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TIME_SLOTS.filter(slot => 
                      DAYS.some(day => {
                        const cell = schedule[day.value][slot]
                        return cell.available || cell.subject
                      })
                    ).map((slot) => (
                      <tr key={slot}>
                        <td className="border border-default-200 bg-default-50 p-2 font-medium text-xs">
                          {slot}
                        </td>
                        {DAYS.map((day) => {
                          const cell = schedule[day.value][slot]
                          const dayAvailability = teacher.availabilities.find(a => a.day === day.value)
                          const teacherAvail = dayAvailability?.teacherAvailabilities.find(ta => ta.timeRange === slot)
                          const currentSubjectId = teacherAvail?.subjectId
                          const currentCourseId = teacherAvail?.course?.id
                          
                          // Find the assigned subject-course combination using both subjectId and courseId
                          let selectValue = "none"
                          if (currentSubjectId && currentCourseId) {
                            const assignedST = teacher.subjectsTeachers.find(
                              st => st.subjectId === currentSubjectId && st.courseId === currentCourseId
                            )
                            if (assignedST) {
                              selectValue = `${assignedST.subjectId}:${assignedST.courseId}`
                            }
                          }
                          
                          return (
                            <td
                              key={day.value}
                              className={`border border-default-200 p-1.5 text-center align-top min-w-[140px] ${
                                cell.subject
                                  ? 'bg-blue-50 dark:bg-blue-950/30'
                                  : cell.available
                                  ? 'bg-green-50 dark:bg-green-950/30'
                                  : ''
                              }`}
                            >
                              {cell.available ? (
                                <Select
                                  key={`${teacher.id}-${day.value}-${slot}`}
                                  value={selectValue}
                                  onValueChange={(value) =>
                                    handleSubjectAssign(
                                      teacher.id,
                                      day.value as 'M' | 'T' | 'W' | 'TH' | 'F',
                                      slot,
                                      value === "none" ? null : value
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-full h-auto min-h-[60px] text-xs">
                                    <SelectValue placeholder="Sin materia" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">Sin materia</SelectItem>
                                    {teacher.subjectsTeachers
                                      .filter((st) => {
                                        // Always include the currently assigned subject-course combination
                                        const isCurrentlyAssigned = currentSubjectId === st.subjectId && currentCourseId === st.courseId
                                        if (isCurrentlyAssigned) return true
                                        
                                        // Filter out subject-course combinations that have all modules assigned
                                        const assignedCount = getAssignedModulesCount(teacher, st.subjectId, st.courseId)
                                        const requiredCount = getRequiredModules(teacher, st.subjectId, st.courseId)
                                        return assignedCount < requiredCount
                                      })
                                      .map((st) => {
                                        const assignedCount = getAssignedModulesCount(teacher, st.subjectId, st.courseId)
                                        const requiredCount = getRequiredModules(teacher, st.subjectId, st.courseId)
                                        return (
                                          <SelectItem key={`${st.subjectId}-${st.courseId}`} value={`${st.subjectId}:${st.courseId}`}>
                                            <div className="text-left">
                                              <div className="font-semibold">{st.subject.name}</div>
                                              <div className="text-[10px] text-muted-foreground">
                                                {st.course.name} ({assignedCount}/{requiredCount} mód.)
                                              </div>
                                            </div>
                                          </SelectItem>
                                        )
                                      })}
                                  </SelectContent>
                                </Select>
                              ) : null}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {filteredTeachers.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            {t('noTeachersFound')}
          </CardContent>
        </Card>
      )}

      {/* Hidden printable content */}
      <div className="hidden">
        <div ref={printRef}>
          <h2>{t('title')}</h2>
          <h3>{new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}</h3>
          {filteredTeachers.map((teacher) => {
            const schedule = getTeacherSchedule(teacher)
            const totalHours = getTotalAvailableHours(teacher)

            return (
              <div key={teacher.id} className="teacher-schedule">
                <div className="teacher-name">
                  {teacher.lastName}, {teacher.firstName}
                  {' — '}
                  {totalHours} {t('hoursAvailable')} | {teacher.subjectsTeachers.length} {t('subjectsAssigned')}
                </div>
                <table>
                  <thead>
                    <tr>
                      <th className="time-col">{t('time')}</th>
                      {DAYS.map((day) => (
                        <th key={day.value}>{day.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TIME_SLOTS.filter(slot => 
                      DAYS.some(day => {
                        const cell = schedule[day.value][slot]
                        return cell.available || cell.subject
                      })
                    ).map((slot) => (
                      <tr key={slot}>
                        <td className="time-col">{slot}</td>
                        {DAYS.map((day) => {
                          const cell = schedule[day.value][slot]
                          return (
                            <td
                              key={day.value}
                              className={
                                cell.subject
                                  ? 'subject-cell'
                                  : cell.available
                                  ? 'available'
                                  : ''
                              }
                            >
                              {cell.subject ? (
                                <div>
                                  <span className="subject-name">{cell.subject.name}</span>
                                  <br />
                                  <span className="course-name">{cell.subject.course} - {cell.subject.classroom}</span>
                                </div>
                              ) : cell.available ? (
                                '✓'
                              ) : ''}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
