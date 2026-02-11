'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Icon } from '@/components/ui/icon'
import { useTranslations } from 'next-intl'
import { deleteTeacher } from './actions'

export default function DeleteTeacherDialog({ teacherId, teacherName }: { teacherId: string, teacherName: string }) {
  const t = useTranslations('teachersPage')
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Icon icon="heroicons-outline:trash" className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('deleteTeacher')}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>{t('deleteTeacherConfirm', { name: teacherName })}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {t('deleteTeacherWarning')}
          </p>
        </div>
        <form action={() => deleteTeacher(teacherId)}>
          <div className="flex justify-end gap-2">
                          <Button type="submit" color="destructive">
                {t('deleteTeacher')}
              </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 