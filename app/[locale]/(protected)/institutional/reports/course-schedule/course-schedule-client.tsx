'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import { useTranslations } from 'next-intl'

interface Course {
  id: string
  name: string
  shift: string
  classroom: {
    id: string
    name: string
  }
  coursesSubjects: {
    subjectId: string
    modules: number
    subject: {
      id: string
      name: string
    }
  }[]
}

interface Teacher {
  id: string
  firstName: string
  lastName: string
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

export default function CourseScheduleClient({ courses, teachers, userRole }: { courses: Course[], teachers: Teacher[], userRole: 'ADMIN' | 'TEACHER' }) {
  const t = useTranslations('courseSchedulePage')
  const printRef = useRef<HTMLDivElement>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all')
  const isAdmin = userRole === 'ADMIN'

  const handlePrint = () => {
    if (!printRef.current) return
    const printContent = printRef.current.innerHTML
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${t('title')} - ${selectedCourseId === 'all' ? t('allCourses') : getCourseName(selectedCourseId)}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; font-size: 11px; }
            h2 { font-size: 18px; margin-bottom: 4px; }
            h3 { font-size: 14px; margin-bottom: 8px; color: #555; }
            .course-schedule { page-break-after: always; margin-bottom: 30px; }
            .course-schedule:last-child { page-break-after: auto; }
            .course-name { font-size: 16px; font-weight: bold; margin: 16px 0 8px 0; padding: 6px 10px; background: #f0f0f0; border-radius: 4px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
            th, td { border: 1px solid #ccc; padding: 4px 6px; text-align: center; vertical-align: top; font-size: 10px; }
            th { background: #e8e8e8; font-weight: bold; font-size: 11px; }
            .time-col { width: 90px; font-weight: 600; background: #f5f5f5; }
            .subject-cell { background: #dbeafe; }
            .subject-name { font-weight: 600; font-size: 10px; }
            .teacher-name { font-size: 9px; color: #666; }
            @media print { body { padding: 10px; } }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const getCourseName = (id: string) => {
    const course = courses.find(c => c.id === id)
    return course ? course.name : ''
  }

  // Filter courses that have assigned subjects with teachers
  const coursesWithAssignments = courses.filter(course => {
    // Check if any teacher has assignments for this course
    return teachers.some(teacher => 
      teacher.availabilities.some(avail => 
        avail.teacherAvailabilities.some(ta => 
          ta.course?.id === course.id && ta.subject
        )
      )
    )
  })

  const filteredCourses = selectedCourseId === 'all'
    ? coursesWithAssignments
    : coursesWithAssignments.filter(c => c.id === selectedCourseId)

  const getCourseSchedule = (course: Course) => {
    const schedule: Record<string, Record<string, { subject: string; teacher: string } | null>> = {}

    // Initialize schedule for all days and time slots
    for (const day of DAYS) {
      schedule[day.value] = {}
      for (const slot of TIME_SLOTS) {
        schedule[day.value][slot] = null
      }
    }

    // Fill in the schedule with teacher assignments
    for (const teacher of teachers) {
      for (const avail of teacher.availabilities) {
        for (const ta of avail.teacherAvailabilities) {
          if (ta.course?.id === course.id && ta.subject) {
            schedule[avail.day][ta.timeRange] = {
              subject: ta.subject.name,
              teacher: `${teacher.lastName}, ${teacher.firstName}`
            }
          }
        }
      }
    }

    return schedule
  }

  // Get relevant time slots based on course shift
  const getRelevantTimeSlots = (course: Course) => {
    if (course.shift === 'MorningShift') {
      // Morning shift: modules 1-8
      return TIME_SLOTS.slice(0, 8)
    } else {
      // Afternoon shift: modules 1-11 (which are modules 7-17 in the full list)
      return TIME_SLOTS.slice(6, 17)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder={t('selectCourse')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allCourses')}</SelectItem>
              {coursesWithAssignments.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
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

      {filteredCourses.map((course) => {
        const schedule = getCourseSchedule(course)

        return (
          <Card key={course.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {course.name}
                  </CardTitle>
                  <div className="flex gap-2 mt-1">
                    <Badge color="info">{course.classroom.name}</Badge>
                    <Badge color="secondary">{course.shift === 'MorningShift' ? 'Turno Mañana' : 'Turno Tarde'}</Badge>
                    <Badge color="success">{course.coursesSubjects.length} {t('subjects')}</Badge>
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
                    {getRelevantTimeSlots(course).map((slot) => (
                      <tr key={slot}>
                        <td className="border border-default-200 bg-default-50 p-2 font-medium text-xs">
                          {slot}
                        </td>
                        {DAYS.map((day) => {
                          const cell = schedule[day.value][slot]
                          
                          return (
                            <td
                              key={day.value}
                              className={`border border-default-200 p-2 text-center align-top min-w-[140px] ${
                                cell ? 'bg-blue-50 dark:bg-blue-950/30' : ''
                              }`}
                            >
                              {cell ? (
                                <div className="text-left">
                                  <div className="font-semibold text-xs">{cell.subject}</div>
                                  <div className="text-[10px] text-muted-foreground mt-0.5">{cell.teacher}</div>
                                </div>
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

      {filteredCourses.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            {coursesWithAssignments.length === 0 
              ? 'No hay cursos con materias y profesores asignados.'
              : t('noCoursesFound')
            }
          </CardContent>
        </Card>
      )}

      <div className="hidden">
        <div ref={printRef}>
          <h2>{t('title')}</h2>
          <h3>{new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}</h3>
          {filteredCourses.map((course) => {
            const schedule = getCourseSchedule(course)

            return (
              <div key={course.id} className="course-schedule">
                <div className="course-name">
                  {course.name} — {course.classroom.name} | {course.shift === 'MorningShift' ? 'Turno Mañana' : 'Turno Tarde'}
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
                    {getRelevantTimeSlots(course).map((slot) => (
                      <tr key={slot}>
                        <td className="time-col">{slot}</td>
                        {DAYS.map((day) => {
                          const cell = schedule[day.value][slot]
                          return (
                            <td
                              key={day.value}
                              className={cell ? 'subject-cell' : ''}
                            >
                              {cell ? (
                                <div>
                                  <span className="subject-name">{cell.subject}</span>
                                  <br />
                                  <span className="teacher-name">{cell.teacher}</span>
                                </div>
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
