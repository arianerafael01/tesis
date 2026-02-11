"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, QrCode, Loader2, Download } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import Image from 'next/image'

interface QRGeneratorProps {
  courses: Array<{
    id: string
    name: string
  }>
}

export function QRGenerator({ courses }: QRGeneratorProps) {
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [date, setDate] = useState<Date>(new Date())
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    if (!selectedCourse) {
      toast.error('Por favor selecciona un curso')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/attendance/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourse,
          date: date.toISOString(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setQrCode(data.qrCode)
        toast.success('Código QR generado correctamente')
      } else {
        toast.error(data.error || 'Error al generar código QR')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!qrCode) return

    const link = document.createElement('a')
    link.href = qrCode
    link.download = `asistencia-${format(date, 'yyyy-MM-dd')}.png`
    link.click()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Generar Código QR para Asistencia
        </CardTitle>
        <CardDescription>
          Los alumnos escanearán este código para marcar su asistencia (válido por 15 minutos)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Curso</Label>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un curso" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
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

        <Button onClick={handleGenerate} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <QrCode className="mr-2 h-4 w-4" />
              Generar Código QR
            </>
          )}
        </Button>

        {qrCode && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg shadow-md">
                <Image
                  src={qrCode}
                  alt="QR Code"
                  width={300}
                  height={300}
                  className="rounded"
                />
              </div>
            </div>
            <Button onClick={handleDownload} variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Descargar QR
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Este código QR expira en 15 minutos
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
