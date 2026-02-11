"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle2, XCircle, Cloud } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

export function GoogleClassroomSync() {
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    teachers?: any[]
  } | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const googleConnected = searchParams.get('google_connected')
  const error = searchParams.get('error')

  const handleConnect = () => {
    window.location.href = '/api/auth/google'
  }

  const handleSync = async () => {
    setSyncing(true)
    setResult(null)

    try {
      const response = await fetch('/api/sync/teachers', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          teachers: data.teachers,
        })
        router.refresh()
      } else {
        setResult({
          success: false,
          message: data.error || 'Error al sincronizar profesores',
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Error de conexión al sincronizar',
      })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Sincronización con Google Classroom
        </CardTitle>
        <CardDescription>
          Importa profesores automáticamente desde Google Classroom
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {googleConnected && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Conectado exitosamente con Google Classroom
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Error de autenticación: {error}
            </AlertDescription>
          </Alert>
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
              {result.teachers && result.teachers.length > 0 && (
                <div className="mt-2 text-sm">
                  <strong>Profesores sincronizados:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {result.teachers.slice(0, 5).map((teacher, idx) => (
                      <li key={idx}>{teacher.name} ({teacher.email})</li>
                    ))}
                    {result.teachers.length > 5 && (
                      <li>... y {result.teachers.length - 5} más</li>
                    )}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleConnect}
            variant="outline"
            className="flex-1"
          >
            <Cloud className="mr-2 h-4 w-4" />
            Conectar con Google
          </Button>

          <Button
            onClick={handleSync}
            disabled={syncing}
            className="flex-1"
          >
            {syncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Sincronizar Profesores
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Nota:</strong> La sincronización importará:</p>
          <ul className="list-disc list-inside ml-2">
            <li>Nombres y emails de profesores</li>
            <li>Cursos que enseñan en Google Classroom</li>
            <li>Se crearán cuentas con contraseña por defecto: <code>profesor123</code></li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
