"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, CheckCircle2, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { markTeacherAttendance } from '@/app/[locale]/(protected)/institutional/attendance/teachers/actions'
import { toast } from 'sonner'

interface TeacherAttendanceFormProps {
  teachers: Array<{
    id: string
    firstName: string
    lastName: string
  }>
}

export function TeacherAttendanceForm({ teachers }: TeacherAttendanceFormProps) {
  const [selectedTeacher, setSelectedTeacher] = useState<string>('')
  const [date, setDate] = useState<Date>(new Date())
  const [status, setStatus] = useState<'PRESENT' | 'ABSENT' | 'LATE' | 'JUSTIFIED'>('PRESENT')
  const [justification, setJustification] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!selectedTeacher) {
      toast.error('Por favor selecciona un profesor')
      return
    }

    setLoading(true)
    try {
      await markTeacherAttendance(
        selectedTeacher,
        date,
        status,
        justification || undefined
      )
      toast.success('Asistencia registrada correctamente')
      setJustification('')
    } catch (error: any) {
      toast.error(error.message || 'Error al registrar asistencia')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Asistencia de Profesores</CardTitle>
        <CardDescription>
          Marca la asistencia diaria de los profesores
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Profesor</Label>
          <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un profesor" />
            </SelectTrigger>
            <SelectContent>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.firstName} {teacher.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Fecha</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, 'PPP', { locale: es })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Estado</Label>
          <Select value={status} onValueChange={(v: any) => setStatus(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PRESENT">Presente</SelectItem>
              <SelectItem value="ABSENT">Ausente</SelectItem>
              <SelectItem value="LATE">Tarde</SelectItem>
              <SelectItem value="JUSTIFIED">Justificado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(status === 'ABSENT' || status === 'JUSTIFIED') && (
          <div className="space-y-2">
            <Label>Justificación</Label>
            <Textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Ingresa la justificación..."
              rows={3}
            />
          </div>
        )}

        <Button onClick={handleSubmit} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registrando...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Registrar Asistencia
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
