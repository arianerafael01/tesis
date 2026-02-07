'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Icon } from '@/components/ui/icon'
import { useTranslations } from 'next-intl'
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
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Icon icon="heroicons-outline:plus" className="mr-2 h-4 w-4" />
          {t('addTeacher')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{t('addNewTeacher')}</DialogTitle>
        </DialogHeader>
        <form action={createTeacher}>
          <div className="grid gap-6 py-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-6">
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
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="idNumber" className="text-sm font-medium">
                  {t('idNumber')}
                </Label>
                <Input
                  id="idNumber"
                  name="idNumber"
                  className="w-full"
                  maxLength={20}
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
                  required
                />
              </div>
            </div>

            {/* Birthdate and Nationality */}
            <div className="grid grid-cols-2 gap-6">
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



 