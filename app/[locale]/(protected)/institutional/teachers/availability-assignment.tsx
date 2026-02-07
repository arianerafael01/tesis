'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Icon } from '@/components/ui/icon'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { createAvailability, removeTimeRange } from './actions'

interface Teacher {
  id: string
  firstName: string
  lastName: string
  availabilities: {
    id: string
    day: 'M' | 'T' | 'W' | 'TH' | 'F'
    timeRanges: string[]
  }[]
}

interface AvailabilityAssignmentProps {
  teacher: Teacher
}

const DAYS = [
  { value: 'M', label: 'Lunes' },
  { value: 'T', label: 'Martes' },
  { value: 'W', label: 'Miércoles' },
  { value: 'TH', label: 'Jueves' },
  { value: 'F', label: 'Viernes' }
]

const TIME_RANGES = [
  '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
  '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00',
  '16:00-17:00', '17:00-18:00', '18:00-19:00', '19:00-20:00'
]

export default function AvailabilityAssignment({ teacher }: AvailabilityAssignmentProps) {
  const t = useTranslations('teachersPage')
  const [selectedDay, setSelectedDay] = useState<string>('')
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('')

  const handleAddAvailability = async () => {
    if (selectedDay && selectedTimeRange) {
      await createAvailability(teacher.id, selectedDay as 'M' | 'T' | 'W' | 'TH' | 'F', selectedTimeRange)
      setSelectedDay('')
      setSelectedTimeRange('')
    }
  }

  const handleRemoveTimeRange = async (day: 'M' | 'T' | 'W' | 'TH' | 'F', timeRange: string) => {
    await removeTimeRange(teacher.id, day, timeRange)
  }

  const getDayLabel = (day: string) => {
    return DAYS.find(d => d.value === day)?.label || day
  }

  const groupedAvailabilities = teacher.availabilities.reduce((acc, availability) => {
    if (!acc[availability.day]) {
      acc[availability.day] = []
    }
    acc[availability.day].push(...availability.timeRanges)
    return acc
  }, {} as Record<string, string[]>)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('availabilitySchedule')}</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedAvailabilities).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(groupedAvailabilities).map(([day, timeRanges]) => (
                <div key={day} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">{getDayLabel(day)}</h4>
                  <div className="flex flex-wrap gap-2">
                    {timeRanges.map((timeRange, index) => (
                      <div key={index} className="flex items-center gap-2 bg-secondary px-4 py-3 rounded-lg border-2 border-gray-200 shadow-sm">
                        <span className="text-sm font-medium">{timeRange}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTimeRange(day as 'M' | 'T' | 'W' | 'TH' | 'F', timeRange)}
                          className="h-8 w-8 p-0 ml-2 text-red-500 hover:bg-red-100 hover:text-red-700"
                          title="Eliminar horario"
                        >
                          <Icon icon="heroicons:trash" className="h-5 w-5" />
                        </Button>
                        {/* Botón de prueba más visible */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveTimeRange(day as 'M' | 'T' | 'W' | 'TH' | 'F', timeRange)}
                          className="h-8 px-3 text-red-600 border-red-300 hover:bg-red-50"
                          title="Eliminar horario (prueba)"
                        >
                          X
                        </Button>
                      </div>
                    ))}
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
                    {TIME_RANGES.map((timeRange) => (
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