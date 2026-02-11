import { prisma } from '@/lib/prisma'
import { getYearEndAttendanceReport } from '@/app/[locale]/(protected)/institutional/attendance/teachers/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Trophy, TrendingUp } from 'lucide-react'

export default async function AttendanceReportsPage() {
  const currentYear = new Date().getFullYear()
  const teacherReport = await getYearEndAttendanceReport(currentYear)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reportes de Asistencia</h1>
        <p className="text-muted-foreground">
          Estadísticas y ranking de asistencia del año {currentYear}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Ranking de Asistencia de Profesores
          </CardTitle>
          <CardDescription>
            Profesores ordenados por mejor porcentaje de asistencia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Profesor</TableHead>
                <TableHead className="text-center">Total Días</TableHead>
                <TableHead className="text-center">Presente</TableHead>
                <TableHead className="text-center">Ausente</TableHead>
                <TableHead className="text-center">Tarde</TableHead>
                <TableHead className="text-center">Justificado</TableHead>
                <TableHead className="text-right">% Asistencia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teacherReport.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No hay datos de asistencia registrados para este año
                  </TableCell>
                </TableRow>
              ) : (
                teacherReport.map((teacher, index) => (
                  <TableRow key={teacher.teacherId}>
                    <TableCell className="font-medium">
                      {index === 0 && <Trophy className="h-4 w-4 text-yellow-500 inline mr-1" />}
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">{teacher.teacherName}</TableCell>
                    <TableCell className="text-center">{teacher.total}</TableCell>
                    <TableCell className="text-center text-green-600">{teacher.present}</TableCell>
                    <TableCell className="text-center text-red-600">{teacher.absent}</TableCell>
                    <TableCell className="text-center text-yellow-600">{teacher.late}</TableCell>
                    <TableCell className="text-center text-blue-600">{teacher.justified}</TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        color={teacher.attendanceRate >= 95 ? 'success' : teacher.attendanceRate >= 85 ? 'warning' : 'destructive'}
                        className="font-semibold"
                      >
                        {teacher.attendanceRate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Mejor Asistencia</CardTitle>
          </CardHeader>
          <CardContent>
            {teacherReport[0] ? (
              <div>
                <p className="text-2xl font-bold">{teacherReport[0].teacherName}</p>
                <p className="text-sm text-muted-foreground">
                  {teacherReport[0].attendanceRate.toFixed(1)}% de asistencia
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sin datos</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
          </CardHeader>
          <CardContent>
            {teacherReport.length > 0 ? (
              <div>
                <p className="text-2xl font-bold">
                  {(teacherReport.reduce((sum, t) => sum + t.attendanceRate, 0) / teacherReport.length).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">
                  Asistencia promedio de todos los profesores
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sin datos</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Profesores</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-2xl font-bold">{teacherReport.length}</p>
              <p className="text-sm text-muted-foreground">
                Profesores con registro de asistencia
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
