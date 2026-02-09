'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Icon } from '@/components/ui/icon'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useRouter } from '@/components/navigation'
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
    subjectId: string
    courseId: string
    subject: {
      id: string
      name: string
      coursesSubjects: {
        courseId: string
        modules: number
      }[]
    }
    course: {
      id: string
      name: string
    }
  }[]
  availabilities: {
    id: string
    day: 'M' | 'T' | 'W' | 'TH' | 'F'
    timeRanges: string[]
    teacherAvailabilities: {
      id: string
      timeRange: string
      subjectId: string | null
      subject: {
        id: string
        name: string
      } | null
    }[]
  }[]
}

interface Subject {
  id: string
  name: string
  coursesSubjects: {
    courseId: string
    course: {
      id: string
      name: string
    }
  }[]
}

export default function EditTeacherDialog({ teacher, availableSubjects }: { teacher: Teacher, availableSubjects: Subject[] }) {
  const t = useTranslations('teachersPage')
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    await updateTeacher(teacher.id, formData)
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Icon icon="heroicons-outline:pencil" className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] w-full p-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('editTeacher')}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">
              <Icon icon="heroicons:user" className="h-4 w-4 mr-2" />
              {t('personalData')}
            </TabsTrigger>
            <TabsTrigger value="subjects">
              <Icon icon="heroicons:book-open" className="h-4 w-4 mr-2" />
              {t('subjects')}
            </TabsTrigger>
            <TabsTrigger value="availability">
              <Icon icon="heroicons:calendar" className="h-4 w-4 mr-2" />
              {t('availability')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="mt-6">
            <form action={handleSubmit}>
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
          </TabsContent>

          <TabsContent value="subjects" className="mt-6">
            <SubjectAssignment teacher={teacher} availableSubjects={availableSubjects} />
          </TabsContent>

          <TabsContent value="availability" className="mt-6">
            <AvailabilityAssignment 
              teacher={teacher} 
              onUpdate={() => {
                router.refresh()
              }}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 