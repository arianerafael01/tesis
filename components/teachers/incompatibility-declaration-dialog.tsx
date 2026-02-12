'use client'

import React, { useState, useRef } from 'react'
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
  const [scannedDocument, setScannedDocument] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [isProcessingOCR, setIsProcessingOCR] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [ocrResults, setOcrResults] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar la declaración jurada')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon icon="heroicons-outline:document-text" className="w-5 h-5" />
            Declaración Jurada de Incompatibilidades
          </DialogTitle>
          <DialogDescription className="text-sm">
            Profesor: <strong>{teacherName}</strong>
            <br />
            Seleccione los horarios en los que el profesor <strong>NO PUEDE</strong> dictar clases porque trabaja en otra institución.
            <br />
            Los horarios NO seleccionados se considerarán como disponibles automáticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
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
              onClick={handleScanClick}
              disabled={isScanning || isProcessingOCR}
              className="w-full sm:w-auto"
            >
              {isScanning ? (
                <>
                  <Icon icon="heroicons-outline:arrow-path" className="w-4 h-4 mr-2 animate-spin" />
                  Escaneando...
                </>
              ) : (
                <>
                  <Icon icon="heroicons-outline:camera" className="w-4 h-4 mr-2" />
                  Escanear DDJJ
                </>
              )}
            </Button>
            {scannedDocument && (
              <>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-green-600 dark:text-green-400">
                  <Icon icon="heroicons-outline:check-circle" className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Documento escaneado</span>
                  <span className="sm:hidden">Escaneado</span>
                </div>
                <Button
                  type="button"
                  variant="default"
                  onClick={handleAutoDetect}
                  disabled={isProcessingOCR}
                  className="w-full sm:w-auto"
                >
                  {isProcessingOCR ? (
                    <>
                      <Icon icon="heroicons-outline:arrow-path" className="w-4 h-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Icon icon="heroicons-outline:sparkles" className="w-4 h-4 mr-2" />
                      Auto-detectar
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
          {isProcessingOCR && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Procesando con OCR...</span>
                <span>{ocrProgress}%</span>
              </div>
              <Progress value={ocrProgress} className="h-2" />
            </div>
          )}
          {validationErrors.length > 0 && (
            <Alert color="destructive" variant="soft" className="mt-3">
              <Icon icon="heroicons-outline:exclamation-triangle" className="w-4 h-4" />
              <AlertDescription className="text-xs">
                <div className="font-semibold mb-1">El documento no puede ser importado:</div>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          {ocrResults && !isProcessingOCR && validationErrors.length === 0 && (
            <Alert color="info" variant="soft" className="mt-3">
              <Icon icon="heroicons-outline:information-circle" className="w-4 h-4" />
              <AlertDescription className="text-xs">
                OCR completado. Revisa los horarios detectados y ajusta manualmente si es necesario.
              </AlertDescription>
            </Alert>
          )}
          {scannedDocument && (
            <div className="mt-3 border rounded-lg p-2 bg-muted/50">
              <div className="relative w-full h-32 sm:h-48">
                <Image
                  src={scannedDocument}
                  alt="Documento DDJJ escaneado"
                  fill
                  className="object-contain rounded"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setScannedDocument(null)}
                className="mt-2 w-full"
              >
                <Icon icon="heroicons-outline:trash" className="w-4 h-4 mr-2" />
                Eliminar documento
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div>
            <h3 className="font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
              <Icon icon="heroicons-outline:sun" className="w-4 h-4" />
              Turno Mañana (TM)
            </h3>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="grid grid-cols-6 gap-1 sm:gap-2 min-w-[500px] sm:min-w-0">
                <div className="font-medium text-xs sm:text-sm py-1">Horario</div>
                {DAYS.map(day => (
                  <div key={day.value} className="font-medium text-xs sm:text-sm text-center py-1">
                    {day.label}
                  </div>
                ))}
                
                {MORNING_SLOTS.map(slot => (
                  <React.Fragment key={slot}>
                    <div className="text-[10px] sm:text-xs py-1 sm:py-2 leading-tight">{slot}</div>
                    {DAYS.map(day => (
                      <div key={`${day.value}-${slot}`} className="flex items-center justify-center py-1">
                        <Checkbox
                          checked={isSlotSelected(day.value, slot)}
                          onCheckedChange={() => toggleSlot(day.value, slot)}
                          className="h-4 w-4 sm:h-5 sm:w-5"
                        />
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
              <Icon icon="heroicons-outline:moon" className="w-4 h-4" />
              Turno Tarde (TT)
            </h3>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="grid grid-cols-6 gap-1 sm:gap-2 min-w-[500px] sm:min-w-0">
                <div className="font-medium text-xs sm:text-sm py-1">Horario</div>
                {DAYS.map(day => (
                  <div key={day.value} className="font-medium text-xs sm:text-sm text-center py-1">
                    {day.label}
                  </div>
                ))}
                
                {AFTERNOON_SLOTS.map(slot => (
                  <React.Fragment key={slot}>
                    <div className="text-[10px] sm:text-xs py-1 sm:py-2 leading-tight">{slot}</div>
                    {DAYS.map(day => (
                      <div key={`${day.value}-${slot}`} className="flex items-center justify-center py-1">
                        <Checkbox
                          checked={isSlotSelected(day.value, slot)}
                          onCheckedChange={() => toggleSlot(day.value, slot)}
                          className="h-4 w-4 sm:h-5 sm:w-5"
                        />
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950 p-3 sm:p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <Icon icon="heroicons-outline:exclamation-triangle" className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs sm:text-sm text-amber-800 dark:text-amber-200">
                <strong>Importante:</strong> Los horarios marcados son aquellos en los que el profesor <strong>NO PUEDE</strong> dar clases.
                El sistema generará automáticamente la disponibilidad en todos los demás horarios.
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Horarios incompatibles seleccionados: <strong>{selectedSlots.size}</strong>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <>
                <Icon icon="heroicons-outline:arrow-path" className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Icon icon="heroicons-outline:check" className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Guardar y Generar Disponibilidad</span>
                <span className="sm:hidden">Guardar</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
