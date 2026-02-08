'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createTeacher(formData: FormData) {
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const idNumber = formData.get('idNumber') as string
  const fileNumber = formData.get('fileNumber') as string
  const birthdate = formData.get('birthdate') as string
  const nationality = formData.get('nationality') as string
  const address = formData.get('address') as string
  const neighborhood = formData.get('neighborhood') as string

  try {
    await prisma.teacher.create({
      data: {
        firstName,
        lastName,
        idNumber,
        fileNumber,
        birthdate: new Date(birthdate),
        nationality,
        address,
        neighborhood,
      }
    })
  } catch (error: any) {
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0]
      if (field === 'idNumber') return { error: 'Ya existe un profesor con ese número de DNI.' }
      if (field === 'fileNumber') return { error: 'Ya existe un profesor con ese número de legajo.' }
      return { error: 'Ya existe un registro con esos datos.' }
    }
    throw error
  }

  revalidatePath('/institutional/teachers')
  return { success: true }
}

export async function updateTeacher(teacherId: string, formData: FormData) {
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const idNumber = formData.get('idNumber') as string
  const fileNumber = formData.get('fileNumber') as string
  const birthdate = formData.get('birthdate') as string
  const nationality = formData.get('nationality') as string
  const address = formData.get('address') as string
  const neighborhood = formData.get('neighborhood') as string

  await prisma.teacher.update({
    where: { id: teacherId },
    data: {
      firstName,
      lastName,
      idNumber,
      fileNumber,
      birthdate: new Date(birthdate),
      nationality,
      address,
      neighborhood,
    }
  })

  revalidatePath('/institutional/teachers')
}

export async function deleteTeacher(teacherId: string) {
  await prisma.teacher.delete({
    where: { id: teacherId }
  })
  revalidatePath('/institutional/teachers')
}

export async function assignSubjectToTeacher(teacherId: string, subjectId: string) {
  await prisma.subjectsTeacher.create({
    data: {
      teacherId,
      subjectId,
    }
  })
  revalidatePath('/institutional/teachers')
}

export async function removeSubjectFromTeacher(teacherId: string, subjectId: string) {
  await prisma.subjectsTeacher.delete({
    where: {
      teacherId_subjectId: {
        teacherId,
        subjectId,
      }
    }
  })
  revalidatePath('/institutional/teachers')
}

export async function createAvailability(teacherId: string, day: 'M' | 'T' | 'W' | 'TH' | 'F', timeRange: string) {
  // Check if availability already exists for this teacher and day
  const existingAvailability = await prisma.availability.findFirst({
    where: {
      teacherId,
      day,
    }
  })

  if (existingAvailability) {
    // Add time range to existing availability
    await prisma.availability.update({
      where: { id: existingAvailability.id },
      data: {
        timeRanges: {
          push: timeRange
        }
      }
    })
  } else {
    // Create new availability
    await prisma.availability.create({
      data: {
        teacherId,
        day,
        timeRanges: [timeRange],
      }
    })
  }

  revalidatePath('/institutional/teachers')
}

export async function deleteAvailability(availabilityId: string) {
  await prisma.availability.delete({
    where: { id: availabilityId }
  })
  revalidatePath('/institutional/teachers')
}

export async function removeTimeRange(teacherId: string, day: 'M' | 'T' | 'W' | 'TH' | 'F', timeRange: string) {
  const availability = await prisma.availability.findFirst({
    where: {
      teacherId,
      day,
    }
  })

  if (availability) {
    const updatedTimeRanges = availability.timeRanges.filter(tr => tr !== timeRange)
    
    if (updatedTimeRanges.length === 0) {
      // Si no quedan rangos, eliminar toda la disponibilidad
      await prisma.availability.delete({
        where: { id: availability.id }
      })
    } else {
      // Actualizar con los rangos restantes
      await prisma.availability.update({
        where: { id: availability.id },
        data: {
          timeRanges: updatedTimeRanges
        }
      })
    }
  }

  revalidatePath('/institutional/teachers')
} 