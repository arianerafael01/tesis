'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Icon } from '@/components/ui/icon'
import { useTranslations } from 'next-intl'
import { deleteClassroom } from './actions'

export default function DeleteClassroomDialog({ classroomId, classroomName }: { classroomId: string, classroomName: string }) {
  const t = useTranslations('classroomsPage')

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Icon icon="heroicons-outline:trash" className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('deleteClassroom')}</DialogTitle>
          <DialogDescription>
            {t('deleteClassroomConfirm', { name: classroomName })}
            <br />
            {t('deleteClassroomWarning')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <form action={deleteClassroom.bind(null, classroomId)}>
            <Button type="submit" color="destructive">
              {t('deleteClassroom')}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 