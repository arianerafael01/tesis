'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import { useTranslations } from 'next-intl'

interface Teacher {
  id: string
  firstName: string
  lastName: string
  subjectsTeachers: {
    subject: {
      id: string
      name: string
      course: {
        id: string
        name: string
        shift: string
        classroom: {
          id: string
          name: string
        }
      }
    }
  }[]
  availabilities: {
    id: string
    day: 'M' | 'T' | 'W' | 'TH' | 'F'
    timeRanges: string[]
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
  const printRef = useRef<HTMLDivElement>(null)
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('all')

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

  // Build schedule data per teacher
  const getTeacherSchedule = (teacher: Teacher) => {
    const schedule: Record<string, Record<string, { available: boolean; subjects: { name: string; course: string; classroom: string }[] }>> = {}

    for (const day of DAYS) {
      schedule[day.value] = {}
      for (const slot of TIME_SLOTS) {
        schedule[day.value][slot] = { available: false, subjects: [] }
      }
    }

    // Mark available slots
    for (const avail of teacher.availabilities) {
      for (const timeRange of avail.timeRanges) {
        if (schedule[avail.day]?.[timeRange]) {
          schedule[avail.day][timeRange].available = true
        }
      }
    }

    // Add subject info to available slots
    for (const st of teacher.subjectsTeachers) {
      const subjectInfo = {
        name: st.subject.name,
        course: st.subject.course.name,
        classroom: st.subject.course.classroom?.name || '-',
      }
      // Attach subject info to all available slots (since we don't have a specific schedule assignment yet)
      for (const avail of teacher.availabilities) {
        for (const timeRange of avail.timeRanges) {
          if (schedule[avail.day]?.[timeRange]) {
            // Only add if not already there
            const exists = schedule[avail.day][timeRange].subjects.some(
              s => s.name === subjectInfo.name && s.course === subjectInfo.course
            )
            if (!exists) {
              schedule[avail.day][timeRange].subjects.push(subjectInfo)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <div className="flex items-center gap-3">
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
                    {TIME_SLOTS.map((slot) => (
                      <tr key={slot}>
                        <td className="border border-default-200 bg-default-50 p-2 font-medium text-xs">
                          {slot}
                        </td>
                        {DAYS.map((day) => {
                          const cell = schedule[day.value][slot]
                          return (
                            <td
                              key={day.value}
                              className={`border border-default-200 p-1.5 text-center align-top min-w-[140px] ${
                                cell.subjects.length > 0
                                  ? 'bg-blue-50 dark:bg-blue-950/30'
                                  : cell.available
                                  ? 'bg-green-50 dark:bg-green-950/30'
                                  : ''
                              }`}
                            >
                              {cell.subjects.length > 0 ? (
                                <div className="space-y-1">
                                  {cell.subjects.map((s, i) => (
                                    <div key={i} className="text-xs">
                                      <div className="font-semibold text-blue-700 dark:text-blue-300">{s.name}</div>
                                      <div className="text-default-500">{s.course}</div>
                                      <div className="text-default-400 text-[10px]">{s.classroom}</div>
                                    </div>
                                  ))}
                                </div>
                              ) : cell.available ? (
                                <span className="text-green-600 dark:text-green-400 text-xs font-medium">
                                  {t('available')}
                                </span>
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
                    {TIME_SLOTS.map((slot) => (
                      <tr key={slot}>
                        <td className="time-col">{slot}</td>
                        {DAYS.map((day) => {
                          const cell = schedule[day.value][slot]
                          return (
                            <td
                              key={day.value}
                              className={
                                cell.subjects.length > 0
                                  ? 'subject-cell'
                                  : cell.available
                                  ? 'available'
                                  : ''
                              }
                            >
                              {cell.subjects.length > 0
                                ? cell.subjects.map((s, i) => (
                                    <div key={i}>
                                      <span className="subject-name">{s.name}</span>
                                      <br />
                                      <span className="course-name">{s.course} - {s.classroom}</span>
                                    </div>
                                  ))
                                : cell.available
                                ? '✓'
                                : ''}
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
