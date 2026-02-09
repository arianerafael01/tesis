'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Icon } from '@/components/ui/icon'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useRouter } from '@/components/navigation'
import { createTeacher, updateTeacher, deleteTeacher } from './teachers/actions'

interface Teacher {
  id: string
  firstName: string
  lastName: string
  idNumber: string
  fileNumber: string
  birthdate: Date
  nationality: string
  address: string
  neighborhood: string
  createdAt: Date
  subjectsTeachers: any[]
}

export default function TeachersClient({ teachers }: { teachers: Teacher[] }) {
  const t = useTranslations('teachersPage')

  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>
      <AddTeacherDialog />
    </div>
  )
}

// Add Teacher Dialog Component
function AddTeacherDialog() {
  const t = useTranslations('teachersPage')
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    const result = await createTeacher(formData)
    if (result?.error) {
      setError(result.error)
      return
    }
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Icon icon="heroicons-outline:plus" className="mr-2 h-4 w-4" />
          {t('addTeacher')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('addNewTeacher')}</DialogTitle>
        </DialogHeader>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}
        <form action={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  {t('firstName')}
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  className="w-full"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  {t('lastName')}
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  className="w-full"
                  required
                />
              </div>
            </div>
            
            {/* ID and File Number Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="idNumber" className="text-sm font-medium">
                  {t('idNumber')}
                </Label>
                <Input
                  id="idNumber"
                  name="idNumber"
                  className="w-full"
                  maxLength={20}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  onKeyDown={(e) => { if (!/[0-9]/.test(e.key) && !['Backspace','Delete','Tab','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault() }}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fileNumber" className="text-sm font-medium">
                  {t('fileNumber')}
                </Label>
                <Input
                  id="fileNumber"
                  name="fileNumber"
                  className="w-full"
                  maxLength={40}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  onKeyDown={(e) => { if (!/[0-9]/.test(e.key) && !['Backspace','Delete','Tab','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault() }}
                  required
                />
              </div>
            </div>

            {/* Birthdate and Nationality */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="birthdate" className="text-sm font-medium">
                  {t('birthdate')}
                </Label>
                <Input
                  id="birthdate"
                  name="birthdate"
                  type="date"
                  className="w-full"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality" className="text-sm font-medium">
                  {t('nationality')}
                </Label>
                <Input
                  id="nationality"
                  name="nationality"
                  className="w-full"
                  maxLength={40}
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
                              <Label htmlFor="address" className="text-sm font-medium">
                  {t('address')}
                </Label>
              <Input
                id="address"
                name="address"
                className="w-full"
                maxLength={100}
                required
              />
            </div>

            {/* Neighborhood */}
            <div className="space-y-2">
                              <Label htmlFor="neighborhood" className="text-sm font-medium">
                  {t('neighborhood')}
                </Label>
              <Input
                id="neighborhood"
                name="neighborhood"
                className="w-full"
                maxLength={100}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="submit">{t('addTeacher')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}



 