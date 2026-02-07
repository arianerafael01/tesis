'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Icon } from '@/components/ui/icon'
import { useTranslations } from 'next-intl'
import { createCourse, updateCourse, deleteCourse } from './courses/actions'

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

export default function CoursesClient({ courses, classrooms }: { 
  courses: Course[]
  classrooms: Classroom[]
}) {
  const t = useTranslations('coursesPage')

  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>
      <AddCourseDialog classrooms={classrooms} />
    </div>
  )
}

// Add Course Dialog Component
function AddCourseDialog({ classrooms }: { classrooms: Classroom[] }) {
  const t = useTranslations('coursesPage')
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Icon icon="heroicons-outline:plus" className="mr-2 h-4 w-4" />
          {t('addCourse')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('addNewCourse')}</DialogTitle>
        </DialogHeader>
        <form action={createCourse}>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                {t('name')}
              </Label>
              <Input
                id="name"
                name="name"
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
                <Select name="shift" required>
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
              <Select name="classRoomId" required>
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
            <Button type="submit">{t('addCourse')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 