'use server'

import { prisma } from "@/lib/prisma"
import { getCurrentUser, canEditTeacherField } from "@/lib/permissions"
import { revalidatePath } from "next/cache"

export async function updateTeacherProfile(teacherId: string, formData: FormData) {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error("Unauthorized")
  }

  // Verify the user can edit this teacher
  if (user.role !== "TEACHER" || user.teacherId !== teacherId) {
    throw new Error("Forbidden: You can only edit your own profile")
  }

  const address = formData.get('address') as string
  const neighborhood = formData.get('neighborhood') as string

  // Verify user can edit these fields
  if (!canEditTeacherField(user, teacherId, 'address') || 
      !canEditTeacherField(user, teacherId, 'neighborhood')) {
    throw new Error("Forbidden: You can only edit address and neighborhood")
  }

  await prisma.teacher.update({
    where: { id: teacherId },
    data: {
      address,
      neighborhood,
    },
  })

  revalidatePath('/profile')
}
