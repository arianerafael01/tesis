'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'
import EditClassroomDialog from './edit-classroom-dialog'
import DeleteClassroomDialog from './delete-classroom-dialog'

interface Classroom {
  id: string
  name: string
  classRoomType: string
  createdAt: Date
  courses: any[]
}

export default function ClassroomsTable({ classrooms }: { classrooms: Classroom[] }) {
  const t = useTranslations('classroomsPage')

  const getClassRoomTypeLabel = (type: string) => {
    switch (type) {
      case 'theoretical':
        return 'Teórica'
      case 'Workshop':
        return 'Taller'
      case 'ComputerLab':
        return 'Laboratorio de Informática'
      case 'Gym':
        return 'Gimnasio'
      default:
        return type
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('classroomsList')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('classRoomType')}</TableHead>
              <TableHead>{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classrooms.map((classroom) => (
              <TableRow key={classroom.id}>
                <TableCell className="font-medium">{classroom.name}</TableCell>
                <TableCell>
                  <Badge color="secondary">{getClassRoomTypeLabel(classroom.classRoomType)}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <EditClassroomDialog classroom={classroom} />
                    <DeleteClassroomDialog classroomId={classroom.id} classroomName={classroom.name} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
} 