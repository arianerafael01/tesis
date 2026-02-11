import { prisma } from '@/lib/prisma'
import { QRGenerator } from '@/components/attendance/qr-generator'
import { QRScanner } from '@/components/attendance/qr-scanner'

export default async function StudentAttendancePage() {
  const courses = await prisma.course.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Asistencia de Alumnos</h1>
        <p className="text-muted-foreground">
          Gestiona la asistencia de alumnos mediante códigos QR
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <QRGenerator courses={courses} />
        <QRScanner />
      </div>
    </div>
  )
}
