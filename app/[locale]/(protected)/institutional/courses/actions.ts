'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createCourse(formData: FormData) {
  const name = formData.get('name') as string
  const shift = formData.get('shift') as string
  const cycle = formData.get('cycle') as string
  const classRoomId = formData.get('classRoomId') as string

  await prisma.course.create({
    data: {
      name,
      shift: shift as any,
      cycle,
      classRoomId,
    }
  })

  revalidatePath('/institutional/courses')
}

export async function updateCourse(courseId: string, formData: FormData) {
  const name = formData.get('name') as string
  const shift = formData.get('shift') as string
  const cycle = formData.get('cycle') as string
  const classRoomId = formData.get('classRoomId') as string

  await prisma.course.update({
    where: { id: courseId },
    data: {
      name,
      shift: shift as any,
      cycle,
      classRoomId,
    }
  })

  revalidatePath('/institutional/courses')
}

export async function deleteCourse(courseId: string) {
  await prisma.course.delete({
    where: { id: courseId }
  })
  revalidatePath('/institutional/courses')
} 