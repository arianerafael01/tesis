'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Icon } from '@/components/ui/icon'
import { useTranslations } from 'next-intl'
import { deleteCourse } from './actions'

export default function DeleteCourseDialog({ courseId, courseName }: { courseId: string, courseName: string }) {
  const t = useTranslations('coursesPage')

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Icon icon="heroicons-outline:trash" className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('deleteCourse')}</DialogTitle>
          <DialogDescription>
            {t('deleteCourseConfirm', { name: courseName })}
            <br />
            {t('deleteCourseWarning')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <form action={deleteCourse.bind(null, courseId)}>
            <Button type="submit" variant="destructive">
              {t('deleteCourse')}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 