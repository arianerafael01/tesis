'use client'

import React, { useState, useRef, useEffect } from 'react'
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
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { createIncompatibilityDeclaration, updateIncompatibilityDeclaration, autoGenerateAvailability } from '@/app/[locale]/(protected)/institutional/teachers/incompatibility-actions'
import { Icon } from '@iconify/react'
import Image from 'next/image'
import { processImageWithOCR, mapSchedulesToIncompatibilities, parseScheduleFromOCR, extractTeacherDataFromDDJJ, validateTeacherData } from '@/lib/ocr-utils'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { useRouter } from 'next/navigation'

type Day = 'M' | 'T' | 'W' | 'TH' | 'F'

interface IncompatibilityDeclarationDialogProps {
  teacherId: string
  teacherName: string
  teacherDNI: string
  teacherFirstName: string
  teacherLastName: string
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
  teacherDNI,
  teacherFirstName,
  teacherLastName,
  existingDeclaration,
  open,
  onOpenChange,
}: IncompatibilityDeclarationDialogProps) {
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [scannedDocument, setScannedDocument] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [isProcessingOCR, setIsProcessingOCR] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [ocrResults, setOcrResults] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Reset state when teacherId changes or when dialog opens
  useEffect(() => {
    if (open) {
      // Reset all states to initial values
      const initial = new Set<string>()
      if (existingDeclaration) {
        existingDeclaration.incompatibilities.forEach(slot => {
          initial.add(`${slot.day}-${slot.timeRange}`)
        })
      }
      setSelectedSlots(initial)
      setScannedDocument(null)
      setIsScanning(false)
      setIsProcessingOCR(false)
      setOcrProgress(0)
      setOcrResults(null)
      setValidationErrors([])
    }
  }, [teacherId, open, existingDeclaration])

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida')
      return
    }

    setIsScanning(true)
    try {
      const reader = new FileReader()
      reader.onloadend = () => {
        setScannedDocument(reader.result as string)
        toast.success('Documento escaneado correctamente')
        setIsScanning(false)
      }
      reader.onerror = () => {
        toast.error('Error al leer el archivo')
        setIsScanning(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error('Error al escanear el documento')
      setIsScanning(false)
    }
  }

  const handleAutoDetect = async () => {
    if (!scannedDocument) {
      toast.error('Primero debes escanear un documento')
      return
    }

    setIsProcessingOCR(true)
    setOcrProgress(0)
    setOcrResults(null)
    setValidationErrors([])

    try {
      toast.info('Procesando documento con OCR...')
      
      const result = await processImageWithOCR(scannedDocument, (progress) => {
        setOcrProgress(progress)
      })

      console.log('OCR Text Extracted:', result.text)
      setOcrResults(result.text)
      
      // Extract and validate teacher data from DDJJ
      const extractedData = extractTeacherDataFromDDJJ(result.text)
      console.log('Teacher data extracted:', extractedData)
      
      const validation = validateTeacherData(extractedData, {
        dni: teacherDNI,
        firstName: teacherFirstName,
        lastName: teacherLastName
      })
      
      console.log('Validation result:', validation)
      
      if (!validation.isValid) {
        setValidationErrors(validation.errors)
        toast.error('El documento no corresponde a este profesor', {
          duration: 6000
        })
        setIsProcessingOCR(false)
        return
      }
      
      toast.success('Documento validado correctamente', {
        duration: 3000
      })
      
      // Parse the OCR text to extract schedules
      const schedules = parseScheduleFromOCR(result.text)
      console.log('Schedules Detected:', schedules)
      
      if (schedules.length === 0) {
        toast.warning('No se detectaron horarios automáticamente. Revisa el texto extraído en la consola y marca los horarios manualmente.', {
          duration: 5000
        })
        setIsProcessingOCR(false)
        return
      }

      // Map schedules to incompatibility slots
      const incompatibilities = mapSchedulesToIncompatibilities(schedules)
      console.log('Incompatibilities Mapped:', incompatibilities)
      
      if (incompatibilities.length === 0) {
        toast.warning('Se detectaron horarios pero no se pudieron mapear a módulos del sistema. Por favor, márcalos manualmente.', {
          duration: 5000
        })
        setIsProcessingOCR(false)
        return
      }
      
      // Add detected slots to selection
      const newSet = new Set(selectedSlots)
      incompatibilities.forEach(slot => {
        newSet.add(`${slot.day}-${slot.timeRange}`)
      })
      setSelectedSlots(newSet)

      toast.success(`Se detectaron ${incompatibilities.length} horarios incompatibles automáticamente. Revisa y ajusta si es necesario.`, {
        duration: 5000
      })
      setIsProcessingOCR(false)
    } catch (error: any) {
      console.error('OCR Error:', error)
      toast.error(error.message || 'Error al procesar el documento con OCR')
      setIsProcessingOCR(false)
    }
  }

  const handleScanClick = () => {
    fileInputRef.current?.click()
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
          incompatibleSlots,
          scannedDocument || undefined
        )
        toast.success('Declaración jurada actualizada exitosamente')
      } else {
        await createIncompatibilityDeclaration(
          teacherId,
          incompatibleSlots,
          scannedDocument || undefined
        )
        toast.success('Declaración jurada creada exitosamente')
      }

      const result = await autoGenerateAvailability(teacherId)
      toast.success(`Disponibilidad generada: ${result.availabilitiesCreated} horarios disponibles`)
      
      // Refresh the page to load updated data
      router.refresh()
      
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar la declaración jurada')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto w-full">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Icon icon="heroicons-outline:document-text" className="w-5 h-5" />
            Declaración Jurada de Incompatibilidades - {teacherName}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Seleccione los horarios en los que el profesor <strong>NO PUEDE</strong> dictar clases. Los horarios NO seleccionados se considerarán disponibles.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-2">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleScanClick}
              disabled={isScanning || isProcessingOCR}
            >
              {isScanning ? (
                <>
                  <Icon icon="heroicons-outline:arrow-path" className="w-4 h-4 mr-1 animate-spin" />
                  Escaneando...
                </>
              ) : (
                <>
                  <Icon icon="heroicons-outline:camera" className="w-4 h-4 mr-1" />
                  Escanear DDJJ
                </>
              )}
            </Button>
            {scannedDocument && (
              <>
                <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <Icon icon="heroicons-outline:check-circle" className="w-4 h-4" />
                  Escaneado
                </div>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleAutoDetect}
                  disabled={isProcessingOCR}
                >
                  {isProcessingOCR ? (
                    <>
                      <Icon icon="heroicons-outline:arrow-path" className="w-4 h-4 mr-1 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Icon icon="heroicons-outline:sparkles" className="w-4 h-4 mr-1" />
                      Auto-detectar
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setScannedDocument(null)}
                >
                  <Icon icon="heroicons-outline:trash" className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
          {isProcessingOCR && (
            <div className="mt-2 space-y-1">
              <Progress value={ocrProgress} className="h-1" />
            </div>
          )}
          {validationErrors.length > 0 && (
            <Alert color="destructive" variant="soft" className="mt-2 py-2">
              <AlertDescription className="text-xs">
                <strong>Error:</strong> {validationErrors[0]}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="font-semibold mb-1.5 flex items-center gap-1.5 text-sm">
              <Icon icon="heroicons-outline:sun" className="w-4 h-4" />
              Turno Mañana
            </h3>
            <div className="border rounded-md overflow-hidden">
              <div className="grid grid-cols-6 gap-0 text-xs">
                <div className="font-medium py-1 px-1 bg-muted/50 border-b">Horario</div>
                {DAYS.map(day => (
                  <div key={day.value} className="font-medium text-center py-1 px-1 bg-muted/50 border-b border-l">
                    {day.label}
                  </div>
                ))}
                
                {MORNING_SLOTS.map(slot => (
                  <React.Fragment key={slot}>
                    <div className="py-0.5 px-1 text-[10px] leading-tight border-b">{slot}</div>
                    {DAYS.map(day => (
                      <div key={`${day.value}-${slot}`} className="flex items-center justify-center py-0.5 border-b border-l">
                        <Checkbox
                          checked={isSlotSelected(day.value, slot)}
                          onCheckedChange={() => toggleSlot(day.value, slot)}
                          className="h-3.5 w-3.5"
                        />
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-1.5 flex items-center gap-1.5 text-sm">
              <Icon icon="heroicons-outline:moon" className="w-4 h-4" />
              Turno Tarde
            </h3>
            <div className="border rounded-md overflow-hidden">
              <div className="grid grid-cols-6 gap-0 text-xs">
                <div className="font-medium py-1 px-1 bg-muted/50 border-b">Horario</div>
                {DAYS.map(day => (
                  <div key={day.value} className="font-medium text-center py-1 px-1 bg-muted/50 border-b border-l">
                    {day.label}
                  </div>
                ))}
                
                {AFTERNOON_SLOTS.map(slot => (
                  <React.Fragment key={slot}>
                    <div className="py-0.5 px-1 text-[10px] leading-tight border-b">{slot}</div>
                    {DAYS.map(day => (
                      <div key={`${day.value}-${slot}`} className="flex items-center justify-center py-0.5 border-b border-l">
                        <Checkbox
                          checked={isSlotSelected(day.value, slot)}
                          onCheckedChange={() => toggleSlot(day.value, slot)}
                          className="h-3.5 w-3.5"
                        />
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-2 border-t">
          <div className="bg-amber-50 dark:bg-amber-950 p-2 rounded border border-amber-200 dark:border-amber-800 flex-1">
            <div className="flex items-start gap-1.5">
              <Icon icon="heroicons-outline:exclamation-triangle" className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-[10px] text-amber-800 dark:text-amber-200">
                Los horarios marcados son aquellos en los que el profesor <strong>NO PUEDE</strong> dar clases.
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            Incompatibles: <strong>{selectedSlots.size}</strong>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} size="sm">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} size="sm">
            {isSubmitting ? (
              <>
                <Icon icon="heroicons-outline:arrow-path" className="w-4 h-4 mr-1 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Icon icon="heroicons-outline:check" className="w-4 h-4 mr-1" />
                Guardar y Generar Disponibilidad
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
