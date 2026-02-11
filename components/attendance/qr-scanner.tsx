"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { QrCode, CheckCircle2, XCircle, Camera } from 'lucide-react'
import { toast } from 'sonner'
import { markStudentAttendanceWithQR } from '@/app/[locale]/(protected)/institutional/attendance/students/actions'

export function QRScanner() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [scanner, setScanner] = useState<any>(null)

  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.stop()
      }
    }
  }, [scanner])

  const startScanning = async () => {
    setScanning(true)
    setResult(null)

    try {
      const { Html5QrcodeScanner } = await import('html5-qrcode')
      
      const qrScanner = new Html5QrcodeScanner(
        'qr-reader',
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      )

      qrScanner.render(
        async (decodedText) => {
          try {
            await markStudentAttendanceWithQR(decodedText)
            setResult({
              success: true,
              message: '¡Asistencia registrada correctamente!',
            })
            toast.success('Asistencia registrada')
            qrScanner.clear()
            setScanning(false)
          } catch (error: any) {
            setResult({
              success: false,
              message: error.message || 'Error al registrar asistencia',
            })
            toast.error(error.message)
          }
        },
        (error) => {
          console.log('QR scan error:', error)
        }
      )

      setScanner(qrScanner)
    } catch (error) {
      toast.error('Error al iniciar la cámara')
      setScanning(false)
    }
  }

  const stopScanning = () => {
    if (scanner) {
      scanner.clear()
      setScanner(null)
    }
    setScanning(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Escanear QR de Asistencia
        </CardTitle>
        <CardDescription>
          Escanea el código QR mostrado por tu profesor para marcar tu asistencia
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!scanning && !result && (
          <Button onClick={startScanning} className="w-full">
            <Camera className="mr-2 h-4 w-4" />
            Iniciar Escaneo
          </Button>
        )}

        {scanning && (
          <>
            <div id="qr-reader" className="w-full"></div>
            <Button onClick={stopScanning} variant="outline" className="w-full">
              Cancelar
            </Button>
          </>
        )}

        {result && (
          <Alert className={result.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
            {result.success ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
              {result.message}
            </AlertDescription>
          </Alert>
        )}

        {result && (
          <Button onClick={() => { setResult(null); startScanning(); }} className="w-full">
            Escanear Otro Código
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
