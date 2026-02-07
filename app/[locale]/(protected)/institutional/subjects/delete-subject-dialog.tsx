'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Icon } from '@/components/ui/icon'
import { useTranslations } from 'next-intl'
import { deleteSubject } from './actions'

export default function DeleteSubjectDialog({ subjectId, subjectName }: { subjectId: string, subjectName: string }) {
  const t = useTranslations()
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Icon icon="heroicons-outline:trash" className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('subjectsPage.deleteSubject')}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>{t('subjectsPage.deleteSubjectConfirm', { name: subjectName })}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {t('subjectsPage.deleteSubjectWarning')}
          </p>
        </div>
        <form action={() => deleteSubject(subjectId)}>
          <div className="flex justify-end gap-2">
                          <Button type="submit" color="destructive">
                {t('subjectsPage.deleteSubject')}
              </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 