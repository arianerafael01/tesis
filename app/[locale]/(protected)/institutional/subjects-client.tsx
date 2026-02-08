'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Icon } from '@/components/ui/icon'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { createSubject, updateSubject, deleteSubject } from './subjects/actions'

interface Subject {
  id: string
  name: string
  courseId: string
  createdAt: Date
  course: {
    id: string
    name: string
  }
  subjectsTeachers: any[]
}

interface Course {
  id: string
  name: string
}

export default function SubjectsClient({ subjects, courses }: { 
  subjects: Subject[]
  courses: Course[]
}) {
  const t = useTranslations('subjectsPage')

  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>
      <AddSubjectDialog courses={courses} />
    </div>
  )
}

// Add Subject Dialog Component
function AddSubjectDialog({ courses }: { courses: Course[] }) {
  const t = useTranslations('subjectsPage')
  const [open, setOpen] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    await createSubject(formData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Icon icon="heroicons-outline:plus" className="mr-2 h-4 w-4" />
          {t('addSubject')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('addNewSubject')}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {t('name')}
              </Label>
              <Input
                id="name"
                name="name"
                className="col-span-3"
                maxLength={40}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="courseId" className="text-right">
                {t('course')}
              </Label>
              <Select name="courseId" required>
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="modules" className="text-right">
                {t('modules')}
              </Label>
              <Input
                id="modules"
                name="modules"
                type="number"
                min={1}
                max={20}
                defaultValue={1}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="submit">{t('addSubject')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}



 