"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { QrCode, CheckCircle2, XCircle, Camera } from 'lucide-react'
import { toast } from 'sonner'
import { markStudentAttendanceWithQR } from '@/app/[locale]/(protected)/institutional/attendance/students/actions'

export function QRScanner() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const scannerRef = useRef<any>(null)
  const qrReaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [])

  const startScanning = async () => {
    setScanning(true)
    setResult(null)

    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      
      const qrScanner = new Html5Qrcode('qr-reader')
      scannerRef.current = qrScanner

      await qrScanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          try {
            await qrScanner.stop()
            await markStudentAttendanceWithQR(decodedText)
            setResult({
              success: true,
              message: '¡Asistencia registrada correctamente!',
            })
            toast.success('Asistencia registrada')
            setScanning(false)
            scannerRef.current = null
          } catch (error: any) {
            setResult({
              success: false,
              message: error.message || 'Error al registrar asistencia',
            })
            toast.error(error.message)
            await qrScanner.stop()
            setScanning(false)
            scannerRef.current = null
          }
        },
        (error) => {
          // Silently ignore decode errors
        }
      )
    } catch (error: any) {
      console.error('Camera error:', error)
      toast.error('Error al iniciar la cámara. Verifica los permisos.')
      setScanning(false)
      scannerRef.current = null
    }
  }

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
      } catch (error) {
        console.error('Error stopping scanner:', error)
      }
      scannerRef.current = null
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
            <div id="qr-reader" ref={qrReaderRef} className="w-full"></div>
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
