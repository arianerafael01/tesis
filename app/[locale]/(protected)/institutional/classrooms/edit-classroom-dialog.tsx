'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Icon } from '@/components/ui/icon'
import { useTranslations } from 'next-intl'
import { updateClassroom } from './actions'

interface Classroom {
  id: string
  name: string
  classRoomType: string
  createdAt: Date
  courses: any[]
}

export default function EditClassroomDialog({ classroom }: { classroom: Classroom }) {
  const t = useTranslations('classroomsPage')
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Icon icon="heroicons-outline:pencil" className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('editClassroom')}</DialogTitle>
        </DialogHeader>
        <form action={(formData) => updateClassroom(classroom.id, formData)}>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                {t('name')}
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={classroom.name}
                className="w-full"
                maxLength={40}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="classRoomType" className="text-sm font-medium">
                {t('classRoomType')}
              </Label>
              <Select name="classRoomType" defaultValue={classroom.classRoomType} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('selectClassRoomType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="theoretical">Teórica</SelectItem>
                  <SelectItem value="Workshop">Taller</SelectItem>
                  <SelectItem value="ComputerLab">Laboratorio de Informática</SelectItem>
                  <SelectItem value="Gym">Gimnasio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="submit">{t('updateClassroom')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 