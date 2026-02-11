'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { createIncompatibilityDeclaration, updateIncompatibilityDeclaration, autoGenerateAvailability } from '@/app/[locale]/(protected)/institutional/teachers/incompatibility-actions'
import { Icon } from '@iconify/react'

type Day = 'M' | 'T' | 'W' | 'TH' | 'F'

interface IncompatibilityDeclarationDialogProps {
  teacherId: string
  teacherName: string
  existingDeclaration?: {
    id: string
    incompatibilities: Array<{
      day: Day
      timeRange: string
    }>
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DAYS: { value: Day; label: string }[] = [
  { value: 'M', label: 'Lunes' },
  { value: 'T', label: 'Martes' },
  { value: 'W', label: 'Miércoles' },
  { value: 'TH', label: 'Jueves' },
  { value: 'F', label: 'Viernes' },
]

const MORNING_SLOTS = [
  'Módulo 1 (7:30-8:10)',
  'Módulo 2 (8:10-8:50)',
  'Módulo 3 (9:00-9:40)',
  'Módulo 4 (9:40-10:20)',
  'Módulo 5 (10:30-11:10)',
  'Módulo 6 (11:10-11:50)',
  'Módulo 7 (12:00-12:40)',
  'Módulo 8 (12:40-13:20)',
]

const AFTERNOON_SLOTS = [
  'Módulo 1 (12:00-12:40)',
  'Módulo 2 (12:40-13:20)',
  'Módulo 3 (13:20-14:10)',
  'Módulo 4 (14:10-14:50)',
  'Módulo 5 (15:00-15:40)',
  'Módulo 6 (15:40-16:20)',
  'Módulo 7 (16:30-17:10)',
  'Módulo 8 (17:10-17:50)',
  'Módulo 9 (18:00-18:40)',
  'Módulo 10 (18:40-19:20)',
  'Módulo 11 (19:30-20:10)',
]

export function IncompatibilityDeclarationDialog({
  teacherId,
  teacherName,
  existingDeclaration,
  open,
  onOpenChange,
}: IncompatibilityDeclarationDialogProps) {
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    if (existingDeclaration) {
      existingDeclaration.incompatibilities.forEach(slot => {
        initial.add(`${slot.day}-${slot.timeRange}`)
      })
    }
    return initial
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleSlot = (day: Day, timeRange: string) => {
    const key = `${day}-${timeRange}`
    const newSet = new Set(selectedSlots)
    if (newSet.has(key)) {
      newSet.delete(key)
    } else {
      newSet.add(key)
    }
    setSelectedSlots(newSet)
  }

  const isSlotSelected = (day: Day, timeRange: string) => {
    return selectedSlots.has(`${day}-${timeRange}`)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const incompatibleSlots = Array.from(selectedSlots).map(key => {
        const [day, ...timeRangeParts] = key.split('-')
        return {
          day: day as Day,
          timeRange: timeRangeParts.join('-')
        }
      })

      if (existingDeclaration) {
        await updateIncompatibilityDeclaration(
          existingDeclaration.id,
          incompatibleSlots
        )
        toast.success('Declaración jurada actualizada exitosamente')
      } else {
        await createIncompatibilityDeclaration(
          teacherId,
          incompatibleSlots
        )
        toast.success('Declaración jurada creada exitosamente')
      }

      const result = await autoGenerateAvailability(teacherId)
      toast.success(`Disponibilidad generada: ${result.availabilitiesCreated} horarios disponibles`)
      
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar la declaración jurada')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon icon="heroicons-outline:document-text" className="w-5 h-5" />
            Declaración Jurada de Incompatibilidades
          </DialogTitle>
          <DialogDescription>
            Profesor: <strong>{teacherName}</strong>
            <br />
            Seleccione los horarios en los que el profesor <strong>NO PUEDE</strong> dictar clases porque trabaja en otra institución.
            <br />
            Los horarios NO seleccionados se considerarán como disponibles automáticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Icon icon="heroicons-outline:sun" className="w-4 h-4" />
              Turno Mañana (TM)
            </h3>
            <div className="grid grid-cols-6 gap-2">
              <div className="font-medium text-sm">Horario</div>
              {DAYS.map(day => (
                <div key={day.value} className="font-medium text-sm text-center">
                  {day.label}
                </div>
              ))}
              
              {MORNING_SLOTS.map(slot => (
                <>
                  <div key={slot} className="text-xs py-2">{slot}</div>
                  {DAYS.map(day => (
                    <div key={`${day.value}-${slot}`} className="flex items-center justify-center">
                      <Checkbox
                        checked={isSlotSelected(day.value, slot)}
                        onCheckedChange={() => toggleSlot(day.value, slot)}
                      />
                    </div>
                  ))}
                </>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Icon icon="heroicons-outline:moon" className="w-4 h-4" />
              Turno Tarde (TT)
            </h3>
            <div className="grid grid-cols-6 gap-2">
              <div className="font-medium text-sm">Horario</div>
              {DAYS.map(day => (
                <div key={day.value} className="font-medium text-sm text-center">
                  {day.label}
                </div>
              ))}
              
              {AFTERNOON_SLOTS.map(slot => (
                <>
                  <div key={slot} className="text-xs py-2">{slot}</div>
                  {DAYS.map(day => (
                    <div key={`${day.value}-${slot}`} className="flex items-center justify-center">
                      <Checkbox
                        checked={isSlotSelected(day.value, slot)}
                        onCheckedChange={() => toggleSlot(day.value, slot)}
                      />
                    </div>
                  ))}
                </>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <Icon icon="heroicons-outline:exclamation-triangle" className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Importante:</strong> Los horarios marcados son aquellos en los que el profesor <strong>NO PUEDE</strong> dar clases.
                El sistema generará automáticamente la disponibilidad en todos los demás horarios.
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Horarios incompatibles seleccionados: <strong>{selectedSlots.size}</strong>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Icon icon="heroicons-outline:arrow-path" className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Icon icon="heroicons-outline:check" className="w-4 h-4 mr-2" />
                Guardar y Generar Disponibilidad
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
