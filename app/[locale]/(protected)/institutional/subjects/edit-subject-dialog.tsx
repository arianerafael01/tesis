'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Icon } from '@/components/ui/icon'
import { useTranslations } from 'next-intl'
import { updateSubject } from './actions'

interface Subject {
  id: string
  name: string
  courseId: string
  course: {
    id: string
    name: string
  }
  subjectsTeachers: {
    teacher: {
      id: string
      firstName: string
      lastName: string
    }
  }[]
}

interface Course {
  id: string
  name: string
}

export default function EditSubjectDialog({ subject, courses }: { subject: Subject, courses: Course[] }) {
  const t = useTranslations('subjectsPage')
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Icon icon="heroicons-outline:pencil" className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('editSubject')}</DialogTitle>
        </DialogHeader>
        <form action={(formData) => updateSubject(subject.id, formData)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {t('name')}
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={subject.name}
                className="col-span-3"
                maxLength={40}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="courseId" className="text-right">
                {t('course')}
              </Label>
              <Select name="courseId" defaultValue={subject.courseId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('selectCourse')} />
                </SelectTrigger>
                <SelectContent>
                  {courses?.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="submit">{t('updateSubject')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 