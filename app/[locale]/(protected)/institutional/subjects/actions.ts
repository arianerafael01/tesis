'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createSubject(formData: FormData) {
  const name = formData.get('name') as string
  const coursesJson = formData.get('courses') as string
  
  // Parse courses array: [{ courseId: string, modules: number }]
  const courses = JSON.parse(coursesJson) as Array<{ courseId: string; modules: number }>

  await prisma.subject.create({
    data: {
      name,
      coursesSubjects: {
        create: courses.map(c => ({
          courseId: c.courseId,
          modules: c.modules,
        }))
      }
    }
  })

  revalidatePath('/institutional/subjects')
}

export async function updateSubject(subjectId: string, formData: FormData) {
  const name = formData.get('name') as string
  const coursesJson = formData.get('courses') as string
  
  // Parse courses array: [{ courseId: string, modules: number }]
  const courses = JSON.parse(coursesJson) as Array<{ courseId: string; modules: number }>

  // Get existing course relationships
  const existingRelations = await prisma.courseSubject.findMany({
    where: { subjectId },
    select: { courseId: true }
  })

  const existingCourseIds = existingRelations.map(r => r.courseId)
  const newCourseIds = courses.map(c => c.courseId)

  // Delete removed courses
  const coursesToDelete = existingCourseIds.filter(id => !newCourseIds.includes(id))
  
  await prisma.subject.update({
    where: { id: subjectId },
    data: {
      name,
      coursesSubjects: {
        // Delete removed courses
        deleteMany: coursesToDelete.length > 0 ? {
          courseId: { in: coursesToDelete }
        } : undefined,
        // Upsert all courses (create new, update existing)
        upsert: courses.map(c => ({
          where: {
            courseId_subjectId: {
              courseId: c.courseId,
              subjectId,
            }
          },
          create: {
            courseId: c.courseId,
            modules: c.modules,
          },
          update: {
            modules: c.modules,
          }
        }))
      }
    }
  })

  revalidatePath('/institutional/subjects')
}

export async function deleteSubject(subjectId: string) {
  await prisma.subject.delete({
    where: { id: subjectId }
  })
  revalidatePath('/institutional/subjects')
} 