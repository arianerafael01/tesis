import { prisma } from '@/lib/prisma'
import { TeacherAttendanceForm } from '@/components/attendance/teacher-attendance-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function TeacherAttendancePage() {
  const teachers = await prisma.teacher.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
    orderBy: {
      lastName: 'asc',
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Asistencia de Profesores</h1>
        <p className="text-muted-foreground">
          Registra y gestiona la asistencia diaria de los profesores
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <TeacherAttendanceForm teachers={teachers} />
        
        <Card>
          <CardHeader>
            <CardTitle>Información</CardTitle>
            <CardDescription>
              Cómo funciona el sistema de asistencia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Estados de Asistencia</h3>
              <ul className="space-y-1 text-sm">
                <li><span className="font-medium text-green-600">Presente:</span> El profesor asistió normalmente</li>
                <li><span className="font-medium text-red-600">Ausente:</span> El profesor no asistió</li>
                <li><span className="font-medium text-yellow-600">Tarde:</span> El profesor llegó tarde</li>
                <li><span className="font-medium text-blue-600">Justificado:</span> Ausencia con justificación</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Reportes</h3>
              <p className="text-sm text-muted-foreground">
                Accede a la sección de reportes para ver estadísticas anuales y el ranking de mejor asistencia.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
