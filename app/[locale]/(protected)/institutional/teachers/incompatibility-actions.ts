'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

type Day = 'M' | 'T' | 'W' | 'TH' | 'F'

interface IncompatibilitySlotInput {
  day: Day
  timeRange: string
}

export async function createIncompatibilityDeclaration(
  teacherId: string,
  incompatibleSlots: IncompatibilitySlotInput[],
  documentUrl?: string
) {
  const session = await auth()
  
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized. Only administrators can manage incompatibility declarations.')
  }

  try {
    const declaration = await prisma.incompatibilityDeclaration.create({
      data: {
        teacherId,
        documentUrl,
        incompatibilities: {
          create: incompatibleSlots.map(slot => ({
            day: slot.day,
            timeRange: slot.timeRange,
          }))
        }
      },
      include: {
        incompatibilities: true
      }
    })

    await generateAvailabilityFromIncompatibilities(teacherId)

    revalidatePath('/institutional/teachers')
    revalidatePath('/institutional/reports/weekly-schedule')
    return { success: true, declaration }
  } catch (error: any) {
    console.error('Error creating incompatibility declaration:', error)
    throw new Error(`Failed to create incompatibility declaration: ${error.message}`)
  }
}

export async function updateIncompatibilityDeclaration(
  declarationId: string,
  incompatibleSlots: IncompatibilitySlotInput[],
  documentUrl?: string
) {
  const session = await auth()
  
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized. Only administrators can manage incompatibility declarations.')
  }

  try {
    const declaration = await prisma.incompatibilityDeclaration.findUnique({
      where: { id: declarationId }
    })

    if (!declaration) {
      throw new Error('Declaration not found')
    }

    await prisma.incompatibilitySlot.deleteMany({
      where: { declarationId }
    })

    const updated = await prisma.incompatibilityDeclaration.update({
      where: { id: declarationId },
      data: {
        documentUrl,
        incompatibilities: {
          create: incompatibleSlots.map(slot => ({
            day: slot.day,
            timeRange: slot.timeRange,
          }))
        }
      },
      include: {
        incompatibilities: true
      }
    })

    await generateAvailabilityFromIncompatibilities(declaration.teacherId)

    revalidatePath('/institutional/teachers')
    revalidatePath('/institutional/reports/weekly-schedule')
    return { success: true, declaration: updated }
  } catch (error: any) {
    console.error('Error updating incompatibility declaration:', error)
    throw new Error(`Failed to update incompatibility declaration: ${error.message}`)
  }
}

export async function deleteIncompatibilityDeclaration(declarationId: string) {
  const session = await auth()
  
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized. Only administrators can manage incompatibility declarations.')
  }

  try {
    const declaration = await prisma.incompatibilityDeclaration.findUnique({
      where: { id: declarationId }
    })

    if (!declaration) {
      throw new Error('Declaration not found')
    }

    await prisma.incompatibilityDeclaration.delete({
      where: { id: declarationId }
    })

    await generateAvailabilityFromIncompatibilities(declaration.teacherId)

    revalidatePath('/institutional/teachers')
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting incompatibility declaration:', error)
    throw new Error(`Failed to delete incompatibility declaration: ${error.message}`)
  }
}

export async function getIncompatibilityDeclaration(teacherId: string) {
  const session = await auth()
  
  if (!session) {
    throw new Error('Unauthorized')
  }

  try {
    const declaration = await prisma.incompatibilityDeclaration.findFirst({
      where: { teacherId },
      include: {
        incompatibilities: true
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    })

    return declaration
  } catch (error: any) {
    console.error('Error fetching incompatibility declaration:', error)
    throw new Error(`Failed to fetch incompatibility declaration: ${error.message}`)
  }
}

async function generateAvailabilityFromIncompatibilities(teacherId: string) {
  // Use unique slots only - avoid duplicates between morning and afternoon
  const allSlots = [
    'Módulo 1 (7:30-8:10)',
    'Módulo 2 (8:10-8:50)',
    'Módulo 3 (9:00-9:40)',
    'Módulo 4 (9:40-10:20)',
    'Módulo 5 (10:30-11:10)',
    'Módulo 6 (11:10-11:50)',
    'Módulo 7 (12:00-12:40)',
    'Módulo 8 (12:40-13:20)',
    'Módulo 9 (13:20-14:10)',
    'Módulo 10 (14:10-14:50)',
    'Módulo 11 (15:00-15:40)',
    'Módulo 12 (15:40-16:20)',
    'Módulo 13 (16:30-17:10)',
    'Módulo 14 (17:10-17:50)',
    'Módulo 15 (18:00-18:40)',
    'Módulo 16 (18:40-19:20)',
    'Módulo 17 (19:30-20:10)',
  ]
  const days: Day[] = ['M', 'T', 'W', 'TH', 'F']

  const declaration = await prisma.incompatibilityDeclaration.findFirst({
    where: { teacherId },
    include: {
      incompatibilities: true
    },
    orderBy: {
      uploadedAt: 'desc'
    }
  })

  const incompatibleSet = new Set<string>()
  if (declaration) {
    declaration.incompatibilities.forEach((slot: { day: string; timeRange: string }) => {
      incompatibleSet.add(`${slot.day}-${slot.timeRange}`)
    })
  }

  await prisma.availability.deleteMany({
    where: { teacherId }
  })

  // Group available time ranges by day
  const availabilityByDay: Record<Day, string[]> = {
    M: [],
    T: [],
    W: [],
    TH: [],
    F: []
  }

  for (const day of days) {
    for (const timeRange of allSlots) {
      const key = `${day}-${timeRange}`
      if (!incompatibleSet.has(key)) {
        availabilityByDay[day].push(timeRange)
      }
    }
  }

  // Create one Availability record per day with array of timeRanges
  const availabilityData = []
  let totalSlots = 0
  for (const day of days) {
    if (availabilityByDay[day].length > 0) {
      availabilityData.push({
        teacherId,
        day,
        timeRanges: availabilityByDay[day]
      })
      totalSlots += availabilityByDay[day].length
    }
  }

  if (availabilityData.length > 0) {
    for (const data of availabilityData) {
      await prisma.availability.create({
        data
      })
    }
  }

  return { success: true, availabilitiesCreated: totalSlots }
}

export async function autoGenerateAvailability(teacherId: string) {
  const session = await auth()
  
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized. Only administrators can generate availability.')
  }

  try {
    const result = await generateAvailabilityFromIncompatibilities(teacherId)
    revalidatePath('/institutional/teachers')
    revalidatePath('/institutional/reports/weekly-schedule')
    return result
  } catch (error: any) {
    console.error('Error auto-generating availability:', error)
    throw new Error(`Failed to auto-generate availability: ${error.message}`)
  }
}
