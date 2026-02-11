"use server"

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'

export async function markTeacherAttendance(
  teacherId: string,
  date: Date,
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'JUSTIFIED',
  justification?: string
) {
  const session = await auth()
  
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized. Only admins can mark teacher attendance.')
  }

  const dateOnly = new Date(date.toISOString().split('T')[0])

  const attendance = await prisma.teacherAttendance.upsert({
    where: {
      teacherId_date: {
        teacherId,
        date: dateOnly,
      },
    },
    update: {
      status,
      justification,
    },
    create: {
      teacherId,
      date: dateOnly,
      status,
      justification,
    },
  })

  revalidatePath('/institutional/attendance/teachers')
  return attendance
}

export async function getTeacherAttendance(teacherId: string, startDate: Date, endDate: Date) {
  const attendances = await prisma.teacherAttendance.findMany({
    where: {
      teacherId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      date: 'desc',
    },
  })

  return attendances
}

export async function getTeacherAttendanceStats(teacherId: string, year: number) {
  const startDate = new Date(year, 0, 1)
  const endDate = new Date(year, 11, 31)

  const attendances = await prisma.teacherAttendance.findMany({
    where: {
      teacherId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  })

  const stats = {
    total: attendances.length,
    present: attendances.filter(a => a.status === 'PRESENT').length,
    absent: attendances.filter(a => a.status === 'ABSENT').length,
    late: attendances.filter(a => a.status === 'LATE').length,
    justified: attendances.filter(a => a.status === 'JUSTIFIED').length,
  }

  const attendanceRate = stats.total > 0 
    ? ((stats.present + stats.late) / stats.total) * 100 
    : 0

  return {
    ...stats,
    attendanceRate: Math.round(attendanceRate * 100) / 100,
  }
}

export async function getYearEndAttendanceReport(year: number) {
  const startDate = new Date(year, 0, 1)
  const endDate = new Date(year, 11, 31)

  const teachers = await prisma.teacher.findMany({
    include: {
      teacherAttendances: {
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
    },
  })

  const report = teachers.map(teacher => {
    const attendances = teacher.teacherAttendances
    const total = attendances.length
    const present = attendances.filter(a => a.status === 'PRESENT').length
    const absent = attendances.filter(a => a.status === 'ABSENT').length
    const late = attendances.filter(a => a.status === 'LATE').length
    const justified = attendances.filter(a => a.status === 'JUSTIFIED').length
    
    const attendanceRate = total > 0 
      ? ((present + late) / total) * 100 
      : 0

    return {
      teacherId: teacher.id,
      teacherName: `${teacher.firstName} ${teacher.lastName}`,
      total,
      present,
      absent,
      late,
      justified,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
    }
  })

  return report.sort((a, b) => b.attendanceRate - a.attendanceRate)
}
