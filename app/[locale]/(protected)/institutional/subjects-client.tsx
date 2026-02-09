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
  createdAt: Date
  coursesSubjects: {
    courseId: string
    modules: number
    course: {
      id: string
      name: string
    }
  }[]
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
  const [selectedCourses, setSelectedCourses] = useState<Array<{ courseId: string; modules: number }>>([])
  const [subjectName, setSubjectName] = useState('')

  const handleAddCourse = (courseId: string) => {
    if (!selectedCourses.find(c => c.courseId === courseId)) {
      setSelectedCourses([...selectedCourses, { courseId, modules: 1 }])
    }
  }

  const handleRemoveCourse = (courseId: string) => {
    setSelectedCourses(selectedCourses.filter(c => c.courseId !== courseId))
  }

  const handleModulesChange = (courseId: string, modules: number) => {
    setSelectedCourses(selectedCourses.map(c => 
      c.courseId === courseId ? { ...c, modules } : c
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const formData = new FormData()
    formData.append('name', subjectName)
    formData.append('courses', JSON.stringify(selectedCourses))
    
    await createSubject(formData)
    setOpen(false)
    setSubjectName('')
    setSelectedCourses([])
  }

  const availableCourses = courses.filter(
    course => !selectedCourses.find(sc => sc.courseId === course.id)
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Icon icon="heroicons-outline:plus" className="mr-2 h-4 w-4" />
          {t('addSubject')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('addNewSubject')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Subject Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {t('name')}
              </Label>
              <Input
                id="name"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="col-span-3"
                maxLength={40}
                required
              />
            </div>

            {/* Add Course Section */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">
                {t('courses')}
              </Label>
              <div className="col-span-3 space-y-2">
                {/* Course Selector */}
                {availableCourses.length > 0 && (
                  <Select onValueChange={handleAddCourse}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectCourse')} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCourses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Selected Courses List */}
                {selectedCourses.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    {t('noCourseSelected')}
                  </p>
                )}
                
                <div className="space-y-2">
                  {selectedCourses.map((sc) => {
                    const course = courses.find(c => c.id === sc.courseId)
                    return (
                      <div key={sc.courseId} className="flex items-center gap-2 p-2 border rounded-lg">
                        <span className="flex-1 font-medium">{course?.name}</span>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`modules-${sc.courseId}`} className="text-sm">
                            Módulos:
                          </Label>
                          <Input
                            id={`modules-${sc.courseId}`}
                            type="number"
                            min={1}
                            max={20}
                            value={sc.modules}
                            onChange={(e) => handleModulesChange(sc.courseId, parseInt(e.target.value) || 1)}
                            className="w-20"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCourse(sc.courseId)}
                        >
                          <Icon icon="heroicons-outline:x" className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={!subjectName || selectedCourses.length === 0}>
              {t('addSubject')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}



 