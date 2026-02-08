'use server'

import { autoAssignSubjects } from '../../teachers/actions'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function autoAssignAllTeachers() {
  const teachers = await prisma.teacher.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true
    }
  })

  const results: Array<{
    teacherId: string
    teacherName: string
    success: boolean
    assignedCount: number
    errors: string[]
  }> = []

  for (const teacher of teachers) {
    try {
      const result = await autoAssignSubjects(teacher.id)
      results.push({
        teacherId: teacher.id,
        teacherName: `${teacher.firstName} ${teacher.lastName}`,
        success: result.success,
        assignedCount: result.assignedCount,
        errors: result.errors
      })
    } catch (error: any) {
      results.push({
        teacherId: teacher.id,
        teacherName: `${teacher.firstName} ${teacher.lastName}`,
        success: false,
        assignedCount: 0,
        errors: [error.message || 'Error desconocido']
      })
    }
  }

  revalidatePath('/institutional/reports/weekly-schedule')
  revalidatePath('/institutional/teachers')

  const totalAssigned = results.reduce((sum, r) => sum + r.assignedCount, 0)
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0)

  return {
    success: true,
    totalAssigned,
    totalErrors,
    results,
    message: `Se asignaron ${totalAssigned} módulos en total para ${teachers.length} profesores.${totalErrors > 0 ? ` Errores: ${totalErrors}` : ''}`
  }
}

export async function unassignAllSubjects() {
  try {
    // Update all TeacherAvailability records to remove subject and course assignments
    const result = await prisma.teacherAvailability.updateMany({
      where: {
        subjectId: { not: null }
      },
      data: {
        subjectId: null,
        courseId: null
      }
    })

    revalidatePath('/institutional/reports/weekly-schedule')
    revalidatePath('/institutional/teachers')

    return {
      success: true,
      count: result.count,
      message: `Se desasignaron ${result.count} módulos exitosamente.`
    }
  } catch (error: any) {
    return {
      success: false,
      count: 0,
      message: `Error al desasignar materias: ${error.message}`
    }
  }
}
