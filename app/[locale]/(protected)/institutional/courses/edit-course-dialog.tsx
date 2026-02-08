'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Icon } from '@/components/ui/icon'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { updateCourse } from './actions'

interface Course {
  id: string
  name: string
  shift: string
  cycle: string
  classRoomId: string
  createdAt: Date
  classroom: {
    id: string
    name: string
  }
  subjects: any[]
}

interface Classroom {
  id: string
  name: string
}

export default function EditCourseDialog({ course, classrooms }: { course: Course, classrooms: Classroom[] }) {
  const t = useTranslations('coursesPage')
  const [open, setOpen] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    await updateCourse(course.id, formData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Icon icon="heroicons-outline:pencil" className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('editCourse')}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                {t('name')}
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={course.name}
                className="w-full"
                maxLength={30}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="shift" className="text-sm font-medium">
                  {t('shift')}
                </Label>
                <Select name="shift" defaultValue={course.shift} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('selectShift')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MorningShift">Turno Mañana</SelectItem>
                    <SelectItem value="LateShift">Turno Tarde</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cycle" className="text-sm font-medium">
                  {t('cycle')}
                </Label>
                <Input
                  id="cycle"
                  name="cycle"
                  defaultValue={course.cycle}
                  className="w-full"
                  maxLength={5}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="classRoomId" className="text-sm font-medium">
                {t('classroom')}
              </Label>
              <Select name="classRoomId" defaultValue={course.classRoomId} required>
                <SelectTrigger className="w-full">
                                      <SelectValue placeholder={t('selectClassroom')} />
                </SelectTrigger>
                <SelectContent>
                  {classrooms.map((classroom) => (
                    <SelectItem key={classroom.id} value={classroom.id}>
                      {classroom.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="submit">{t('updateCourse')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 