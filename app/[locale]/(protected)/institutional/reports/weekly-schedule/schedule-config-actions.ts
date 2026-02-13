'use server'

import { prisma } from '@/lib/prisma'
import { Shift } from '@/lib/generated/prisma'
import { revalidatePath } from 'next/cache'

export async function getScheduleConfigs() {
  const configs = await prisma.schoolScheduleConfig.findMany({
    include: {
      modules: {
        orderBy: { moduleNumber: 'asc' },
      },
      breaks: {
        orderBy: { afterModule: 'asc' },
      },
    },
    orderBy: { shift: 'asc' },
  })
  return configs
}

export async function getActiveScheduleConfig(shift: Shift) {
  const config = await prisma.schoolScheduleConfig.findFirst({
    where: {
      shift,
      isActive: true,
    },
    include: {
      modules: {
        orderBy: { moduleNumber: 'asc' },
      },
      breaks: {
        orderBy: { afterModule: 'asc' },
      },
    },
  })
  return config
}

export async function createScheduleConfig(data: {
  name: string
  shift: Shift
  startTime: string
  totalModules: number
  breaks: { afterModule: number; durationMinutes: number }[]
}) {
  try {
    // Calculate module times
    const modules = calculateModules(data.startTime, data.totalModules, data.breaks)

    const config = await prisma.schoolScheduleConfig.create({
      data: {
        name: data.name,
        shift: data.shift,
        startTime: data.startTime,
        isActive: true,
        modules: {
          createMany: {
            data: modules.map((mod) => ({
              moduleNumber: mod.number,
              startTime: mod.start,
              endTime: mod.end,
            })),
          },
        },
        breaks: {
          createMany: {
            data: data.breaks,
          },
        },
      },
      include: {
        modules: true,
        breaks: true,
      },
    })

    revalidatePath('/[locale]/institutional/reports/weekly-schedule')
    return { success: true, config }
  } catch (error: any) {
    console.error('Error creating schedule config:', error)
    return { success: false, error: error.message }
  }
}

export async function updateScheduleConfig(
  id: string,
  data: {
    name?: string
    startTime?: string
    totalModules?: number
    breaks?: { afterModule: number; durationMinutes: number }[]
  }
) {
  try {
    const config = await prisma.schoolScheduleConfig.findUnique({
      where: { id },
      include: { modules: true, breaks: true },
    })

    if (!config) {
      return { success: false, error: 'Configuración no encontrada' }
    }

    // If startTime, totalModules, or breaks changed, recalculate modules
    if (data.startTime || data.totalModules || data.breaks) {
      const startTime = data.startTime || config.startTime
      const totalModules = data.totalModules || config.modules.length
      const breaks = data.breaks || config.breaks.map((b) => ({ afterModule: b.afterModule, durationMinutes: b.durationMinutes }))

      const modules = calculateModules(startTime, totalModules, breaks)

      // Delete old modules and breaks
      await prisma.scheduleModule.deleteMany({ where: { configId: id } })
      await prisma.scheduleBreak.deleteMany({ where: { configId: id } })

      // Create new modules and breaks
      await prisma.scheduleModule.createMany({
        data: modules.map((mod) => ({
          configId: id,
          moduleNumber: mod.number,
          startTime: mod.start,
          endTime: mod.end,
        })),
      })

      await prisma.scheduleBreak.createMany({
        data: breaks.map((b) => ({ configId: id, ...b })),
      })
    }

    // Update config
    const updated = await prisma.schoolScheduleConfig.update({
      where: { id },
      data: {
        name: data.name,
        startTime: data.startTime,
      },
      include: {
        modules: { orderBy: { moduleNumber: 'asc' } },
        breaks: { orderBy: { afterModule: 'asc' } },
      },
    })

    revalidatePath('/[locale]/institutional/reports/weekly-schedule')
    return { success: true, config: updated }
  } catch (error: any) {
    console.error('Error updating schedule config:', error)
    return { success: false, error: error.message }
  }
}

export async function deleteScheduleConfig(id: string) {
  try {
    await prisma.schoolScheduleConfig.delete({ where: { id } })
    revalidatePath('/[locale]/institutional/reports/weekly-schedule')
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting schedule config:', error)
    return { success: false, error: error.message }
  }
}

export async function toggleScheduleConfigActive(id: string) {
  try {
    const config = await prisma.schoolScheduleConfig.findUnique({ where: { id } })
    if (!config) {
      return { success: false, error: 'Configuración no encontrada' }
    }

    await prisma.schoolScheduleConfig.update({
      where: { id },
      data: { isActive: !config.isActive },
    })

    revalidatePath('/[locale]/institutional/reports/weekly-schedule')
    return { success: true }
  } catch (error: any) {
    console.error('Error toggling schedule config:', error)
    return { success: false, error: error.message }
  }
}

// Helper function to calculate module times
function calculateModules(
  startTime: string,
  totalModules: number,
  breaks: { afterModule: number; durationMinutes: number }[]
): { number: number; start: string; end: string }[] {
  const modules: { number: number; start: string; end: string }[] = []
  let currentTime = parseTime(startTime)

  for (let i = 1; i <= totalModules; i++) {
    const start = formatTime(currentTime)
    currentTime = addMinutes(currentTime, 40) // Each module is 40 minutes
    const end = formatTime(currentTime)

    modules.push({ number: i, start, end })

    // Check if there's a break after this module
    const breakAfter = breaks.find((b) => b.afterModule === i)
    if (breakAfter) {
      currentTime = addMinutes(currentTime, breakAfter.durationMinutes)
    }
  }

  return modules
}

function parseTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

function addMinutes(time: number, minutes: number): number {
  return time + minutes
}
