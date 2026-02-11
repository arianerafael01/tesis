"use server"

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { parseQRData, validateQRToken } from '@/lib/qr-utils'
import { cookies } from 'next/headers'
import { getClassroomClient } from '@/lib/google-classroom'

export async function markStudentAttendanceWithQR(
  qrDataString: string,
  studentGoogleId?: string
) {
  const qrData = parseQRData(qrDataString)
  
  if (!qrData) {
    throw new Error('Invalid QR code format')
  }

  if (!validateQRToken(qrData)) {
    throw new Error('QR code has expired. Please request a new one from your teacher.')
  }

  let verifiedBy = studentGoogleId

  if (!verifiedBy) {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('google_access_token')?.value

    if (accessToken) {
      try {
        const classroom = getClassroomClient(accessToken)
        const userProfile = await classroom.userProfiles.get({ userId: 'me' })
        verifiedBy = userProfile.data.id || undefined
      } catch (error) {
        console.error('Error getting Google profile:', error)
      }
    }
  }

  const student = await prisma.student.findFirst({
    where: {
      OR: [
        { googleId: verifiedBy },
        { courseId: qrData.courseId }
      ]
    }
  })

  if (!student) {
    throw new Error('Student not found or not enrolled in this course')
  }

  if (student.courseId !== qrData.courseId) {
    throw new Error('You are not enrolled in this course')
  }

  const dateOnly = new Date(qrData.date)

  const attendance = await prisma.studentAttendance.upsert({
    where: {
      studentId_date: {
        studentId: student.id,
        date: dateOnly,
      },
    },
    update: {
      status: 'PRESENT',
      qrCodeUsed: true,
      verifiedBy,
    },
    create: {
      studentId: student.id,
      courseId: qrData.courseId,
      date: dateOnly,
      status: 'PRESENT',
      qrCodeUsed: true,
      verifiedBy,
    },
  })

  revalidatePath('/institutional/attendance/students')
  return attendance
}

export async function markStudentAttendanceManual(
  studentId: string,
  courseId: string,
  date: Date,
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'JUSTIFIED'
) {
  const session = await auth()
  
  if (!session || session.user.role !== 'TEACHER') {
    throw new Error('Unauthorized. Only teachers can mark student attendance manually.')
  }

  const dateOnly = new Date(date.toISOString().split('T')[0])

  const attendance = await prisma.studentAttendance.upsert({
    where: {
      studentId_date: {
        studentId,
        date: dateOnly,
      },
    },
    update: {
      status,
    },
    create: {
      studentId,
      courseId,
      date: dateOnly,
      status,
      qrCodeUsed: false,
    },
  })

  revalidatePath('/institutional/attendance/students')
  return attendance
}

export async function getStudentAttendance(studentId: string, startDate: Date, endDate: Date) {
  const attendances = await prisma.studentAttendance.findMany({
    where: {
      studentId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      course: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  })

  return attendances
}

export async function getCourseAttendanceStats(courseId: string, year: number) {
  const startDate = new Date(year, 0, 1)
  const endDate = new Date(year, 11, 31)

  const students = await prisma.student.findMany({
    where: { courseId },
    include: {
      studentAttendances: {
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
    },
  })

  const report = students.map(student => {
    const attendances = student.studentAttendances
    const total = attendances.length
    const present = attendances.filter(a => a.status === 'PRESENT').length
    const absent = attendances.filter(a => a.status === 'ABSENT').length
    const late = attendances.filter(a => a.status === 'LATE').length
    const justified = attendances.filter(a => a.status === 'JUSTIFIED').length
    
    const attendanceRate = total > 0 
      ? ((present + late) / total) * 100 
      : 0

    return {
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
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
