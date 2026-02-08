'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createSubject(formData: FormData) {
  const name = formData.get('name') as string
  const courseId = formData.get('courseId') as string
  const modules = parseInt(formData.get('modules') as string) || 1

  await prisma.subject.create({
    data: {
      name,
      courseId,
      modules,
    }
  })

  revalidatePath('/institutional/subjects')
}

export async function updateSubject(subjectId: string, formData: FormData) {
  const name = formData.get('name') as string
  const courseId = formData.get('courseId') as string
  const modules = parseInt(formData.get('modules') as string) || 1

  await prisma.subject.update({
    where: { id: subjectId },
    data: {
      name,
      courseId,
      modules,
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