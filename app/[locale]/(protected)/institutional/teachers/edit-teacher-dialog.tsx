'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Icon } from '@/components/ui/icon'
import { useTranslations } from 'next-intl'
import { updateTeacher } from './actions'
import SubjectAssignment from './subject-assignment'
import AvailabilityAssignment from './availability-assignment'

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
  subjectsTeachers: {
    subject: {
      id: string
      name: string
      course: {
        id: string
        name: string
      }
    }
  }[]
  availabilities: {
    id: string
    day: 'M' | 'T' | 'W' | 'TH' | 'F'
    timeRanges: string[]
  }[]
}

interface Subject {
  id: string
  name: string
  course: {
    id: string
    name: string
  }
}

export default function EditTeacherDialog({ teacher, availableSubjects }: { teacher: Teacher, availableSubjects: Subject[] }) {
  const t = useTranslations('teachersPage')
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Icon icon="heroicons-outline:pencil" className="h-4 w-4" />
        </Button>
      </DialogTrigger>
              <DialogContent className="w-[98vw] max-w-[2000px] max-h-[95vh] overflow-y-auto p-8">
        <DialogHeader>
          <DialogTitle>{t('editTeacher')}</DialogTitle>
        </DialogHeader>
                <form action={(formData) => updateTeacher(teacher.id, formData)}>
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
                  defaultValue={teacher.firstName}
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
                  defaultValue={teacher.lastName}
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
                  defaultValue={teacher.idNumber}
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
                  defaultValue={teacher.fileNumber}
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
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="birthdate" className="text-sm font-medium">
                  {t('birthdate')}
                </Label>
                <Input
                  id="birthdate"
                  name="birthdate"
                  type="date"
                  defaultValue={teacher.birthdate.toISOString().split('T')[0]}
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
                  defaultValue={teacher.nationality}
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
                defaultValue={teacher.address}
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
                defaultValue={teacher.neighborhood}
                className="w-full"
                maxLength={100}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="submit">{t('updateTeacher')}</Button>
          </div>
        </form>

        {/* Subject Assignment Section */}
        <div className="mt-8 border-t pt-6">
          <SubjectAssignment teacher={teacher} availableSubjects={availableSubjects} />
        </div>

        {/* Availability Assignment Section */}
        <div className="mt-8 border-t pt-6">
          <AvailabilityAssignment teacher={teacher} />
        </div>
      </DialogContent>
    </Dialog>
  )
} 