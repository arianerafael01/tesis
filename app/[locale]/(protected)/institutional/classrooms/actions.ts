'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createClassroom(formData: FormData) {
  const name = formData.get('name') as string
  const classRoomType = formData.get('classRoomType') as string

  await prisma.classroom.create({
    data: {
      name,
      classRoomType: classRoomType as any,
    }
  })

  revalidatePath('/institutional/classrooms')
}

export async function updateClassroom(classroomId: string, formData: FormData) {
  const name = formData.get('name') as string
  const classRoomType = formData.get('classRoomType') as string

  await prisma.classroom.update({
    where: { id: classroomId },
    data: {
      name,
      classRoomType: classRoomType as any,
    }
  })

  revalidatePath('/institutional/classrooms')
}

export async function deleteClassroom(classroomId: string) {
  await prisma.classroom.delete({
    where: { id: classroomId }
  })
  revalidatePath('/institutional/classrooms')
} 