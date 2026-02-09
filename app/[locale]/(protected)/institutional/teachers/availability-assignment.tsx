'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Icon } from '@/components/ui/icon'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createAvailability, removeTimeRange, assignSubjectToTimeSlot } from './actions'
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

interface AvailabilityAssignmentProps {
  teacher: Teacher
  onUpdate?: () => void
}

const DAYS = [
  { value: 'M', label: 'Lunes' },
  { value: 'T', label: 'Martes' },
  { value: 'W', label: 'Miércoles' },
  { value: 'TH', label: 'Jueves' },
  { value: 'F', label: 'Viernes' }
]

const TIME_RANGES = [
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

export default function AvailabilityAssignment({ teacher, onUpdate }: AvailabilityAssignmentProps) {
  const t = useTranslations('teachersPage')
  const router = useRouter()
  const [selectedDay, setSelectedDay] = useState<string>('')
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('')

  useEffect(() => {
    if (selectedDay) {
      // Find available time ranges for the selected day
      const dayAvailabilities = teacher.availabilities.find((a: any) => a.day === selectedDay)
      const assignedTimeRanges = dayAvailabilities?.timeRanges || []
      const availableTimeRanges = TIME_RANGES.filter(timeRange => !assignedTimeRanges.includes(timeRange))
      
      // Auto-select the first available time range
      if (availableTimeRanges.length > 0) {
        setSelectedTimeRange(availableTimeRanges[0])
      } else {
        setSelectedTimeRange('')
      }
    } else {
      setSelectedTimeRange('')
    }
  }, [selectedDay, teacher.availabilities])

  const handleAddAvailability = async () => {
    if (selectedDay && selectedTimeRange) {
      await createAvailability(teacher.id, selectedDay as 'M' | 'T' | 'W' | 'TH' | 'F', selectedTimeRange)
      
      // Keep the selected day and find the next available time range
      const dayAvailabilities = teacher.availabilities.find((a: any) => a.day === selectedDay)
      const currentAssignedTimeRanges = dayAvailabilities?.timeRanges || []
      
      // Add the just-added time range to the list
      const updatedAssignedTimeRanges = [...currentAssignedTimeRanges, selectedTimeRange]
      
      // Find the first available time range that hasn't been assigned yet
      const nextAvailableTimeRange = TIME_RANGES.find(timeRange => 
        !updatedAssignedTimeRanges.includes(timeRange)
      )
      
      // Set the next available time range, or empty if none available
      setSelectedTimeRange(nextAvailableTimeRange || '')
      
      router.refresh()
      onUpdate?.()
    }
  }

  const handleRemoveTimeRange = async (day: 'M' | 'T' | 'W' | 'TH' | 'F', timeRange: string) => {
    await removeTimeRange(teacher.id, day, timeRange)
    router.refresh()
    onUpdate?.()
  }

  const handleSubjectAssign = async (day: 'M' | 'T' | 'W' | 'TH' | 'F', timeRange: string, value: string | null) => {
    try {
      if (value === null) {
        await assignSubjectToTimeSlot(teacher.id, day, timeRange, null, null)
      } else {
        // value format: "subjectId:courseId"
        const [subjectId, courseId] = value.split(':')
        await assignSubjectToTimeSlot(teacher.id, day, timeRange, subjectId, courseId)
      }
      toast.success('Materia asignada correctamente')
      router.refresh()
      onUpdate?.()
    } catch (error: any) {
      console.error('Error assigning subject:', error)
      toast.error(error.message || 'Error al asignar la materia')
    }
  }

  const getDayLabel = (day: string) => {
    return DAYS.find(d => d.value === day)?.label || day
  }

  const getAvailableTimeRanges = () => {
    if (!selectedDay) return TIME_RANGES
    
    const dayAvailabilities = teacher.availabilities.find((a: any) => a.day === selectedDay)
    const assignedTimeRanges = dayAvailabilities?.timeRanges || []
    
    return TIME_RANGES.filter(timeRange => !assignedTimeRanges.includes(timeRange))
  }

  // Calculate required modules from CourseSubject for each subject-course combination
  const requiredModules = teacher.subjectsTeachers.reduce((sum: number, st: any) => {
    const courseSubject = st.subject.coursesSubjects?.find((cs: any) => cs.courseId === st.courseId)
    return sum + (courseSubject?.modules || 0)
  }, 0)
  
  const currentModules = teacher.availabilities.reduce((sum: number, a: any) => 
    sum + a.teacherAvailabilities.filter((ta: any) => ta.subjectId).length, 0
  )
  const missingModules = Math.max(0, requiredModules - currentModules)

  const groupedAvailabilities = teacher.availabilities.reduce((acc: any, availability: any) => {
    if (!acc[availability.day]) {
      acc[availability.day] = []
    }
    availability.timeRanges.forEach((tr: any) => {
      if (!acc[availability.day].includes(tr)) {
        acc[availability.day].push(tr)
      }
    })
    return acc
  }, {} as Record<string, string[]>)

  const subjectIds = teacher.subjectsTeachers.map((st: any) => st.subject.id)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('availabilitySchedule')}</CardTitle>
        </CardHeader>
        <CardContent>
          {requiredModules > 0 && (
            <div className={`flex items-center justify-between px-4 py-3 rounded-lg mb-4 ${
              currentModules >= requiredModules
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-amber-50 border border-amber-200 text-amber-700'
            }`}>
              <div className="text-sm">
                <span className="font-semibold">Módulos cargados: {currentModules} / {requiredModules}</span>
                {missingModules > 0 && (
                  <span className="ml-2">(faltan {missingModules})</span>
                )}
              </div>
              <div className="text-xs">
                {teacher.subjectsTeachers.map((st: any) => {
                  const courseSubject = st.subject.coursesSubjects?.find((cs: any) => cs.courseId === st.courseId)
                  return (
                    <span key={`${st.subject.id}:${st.courseId}`} className="mr-3">
                      {st.subject.name} ({st.course.name}): {courseSubject?.modules || 0} mód.
                    </span>
                  )
                })}
              </div>
            </div>
          )}
          {Object.keys(groupedAvailabilities).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(groupedAvailabilities).map(([day, timeRanges]) => (
                <div key={day} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">{getDayLabel(day)}</h4>
                  <div className="space-y-2">
                    {(timeRanges as string[]).map((timeRange: string, index: number) => {
                      const dayAvailability = teacher.availabilities.find((a: any) => a.day === day)
                      const teacherAvail = dayAvailability?.teacherAvailabilities.find((ta: any) => ta.timeRange === timeRange)
                      
                      // Find which subject-course combination is assigned
                      const assignedST = teacherAvail?.subjectId 
                        ? teacher.subjectsTeachers.find((st: any) => st.subject.id === teacherAvail.subjectId)
                        : null
                      
                      const selectValue = assignedST
                        ? `${assignedST.subject.id}:${assignedST.courseId}`
                        : "none"
                      
                      return (
                        <div key={index} className="flex items-center gap-2 bg-secondary px-4 py-3 rounded-lg border-2 border-gray-200 shadow-sm">
                          <span className="text-sm font-medium flex-1">{timeRange}</span>
                          
                          <Select
                            key={`${day}-${timeRange}`}
                            value={selectValue}
                            onValueChange={(value) =>
                              handleSubjectAssign(
                                day as 'M' | 'T' | 'W' | 'TH' | 'F',
                                timeRange,
                                value === "none" ? null : value
                              )
                            }
                          >
                            <SelectTrigger className="w-64">
                              <SelectValue placeholder="Sin materia" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                Sin materia
                              </SelectItem>
                              {teacher.subjectsTeachers.map((st: any) => (
                                <SelectItem key={`${st.subject.id}:${st.courseId}`} value={`${st.subject.id}:${st.courseId}`}>
                                  {st.subject.name} - {st.course.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveTimeRange(day as 'M' | 'T' | 'W' | 'TH' | 'F', timeRange)}
                            className="h-8 px-3 text-red-600 border-red-300 hover:bg-red-50"
                            title="Eliminar horario"
                          >
                            X
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">{t('noAvailabilitySet')}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('addAvailability')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('selectDay')}</label>
                <Select value={selectedDay} onValueChange={setSelectedDay}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectDayPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('selectTimeRange')}</label>
                <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectTimeRangePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableTimeRanges().map((timeRange) => (
                      <SelectItem key={timeRange} value={timeRange}>
                        {timeRange}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              onClick={handleAddAvailability}
              disabled={!selectedDay || !selectedTimeRange}
              className="w-full"
            >
              <Icon icon="heroicons:plus" className="h-4 w-4 mr-2" />
              {t('addTimeRange')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}