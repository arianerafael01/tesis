import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getClassroomClient } from '@/lib/google-classroom'
import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('google_access_token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No Google access token found. Please authenticate first.' },
        { status: 401 }
      )
    }

    const classroom = getClassroomClient(accessToken)

    const coursesResponse = await classroom.courses.list({
      pageSize: 100,
    })

    const courses = coursesResponse.data.courses || []
    const teachersMap = new Map<string, any>()

    for (const course of courses) {
      if (!course.id) continue

      const teachersResponse = await classroom.courses.teachers.list({
        courseId: course.id,
      })

      const teachers = teachersResponse.data.teachers || []

      for (const teacher of teachers) {
        if (!teacher.userId || !teacher.profile) continue

        const teacherId = teacher.userId
        const profile = teacher.profile

        if (!teachersMap.has(teacherId)) {
          teachersMap.set(teacherId, {
            googleId: teacherId,
            email: profile.emailAddress || '',
            name: profile.name?.fullName || '',
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            courses: [],
          })
        }

        teachersMap.get(teacherId).courses.push({
          name: course.name,
          section: course.section,
        })
      }
    }

    const syncedTeachers = []
    const hashedPassword = await bcrypt.hash('profesor123', 10)

    for (const [googleId, teacherData] of teachersMap) {
      let teacher = await prisma.teacher.findFirst({
        where: {
          OR: [
            { googleId },
            { user: { email: teacherData.email } }
          ]
        },
        include: { user: true }
      })

      if (!teacher) {
        teacher = await prisma.teacher.create({
          data: {
            firstName: teacherData.firstName,
            lastName: teacherData.lastName,
            googleId,
            idNumber: `GOOGLE-${googleId.substring(0, 8)}`,
            fileNumber: `G-${Date.now()}`,
            birthdate: new Date('1990-01-01'),
            nationality: 'Argentina',
            address: 'Importado de Google Classroom',
            neighborhood: 'N/A',
            user: {
              create: {
                email: teacherData.email,
                password: hashedPassword,
                name: teacherData.name,
                role: 'TEACHER',
              }
            }
          },
          include: { user: true }
        })
      } else if (!teacher.googleId) {
        teacher = await prisma.teacher.update({
          where: { id: teacher.id },
          data: { googleId },
          include: { user: true }
        })
      }

      syncedTeachers.push({
        id: teacher.id,
        name: teacherData.name,
        email: teacherData.email,
        courses: teacherData.courses,
      })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${syncedTeachers.length} teachers from Google Classroom`,
      teachers: syncedTeachers,
    })
  } catch (error: any) {
    console.error('Error syncing teachers:', error)
    return NextResponse.json(
      { 
        error: 'Failed to sync teachers from Google Classroom',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
