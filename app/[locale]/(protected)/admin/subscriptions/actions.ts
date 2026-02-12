'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

/**
 * Toggle Google Classroom subscription for a user
 */
export async function toggleGoogleClassroomSubscription(userId: string, enabled: boolean) {
  const session = await auth()
  
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized. Only administrators can manage subscriptions.')
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { hasGoogleClassroomSubscription: enabled }
    })

    revalidatePath('/admin/subscriptions')
    revalidatePath('/institutional/teachers')
    
    return { 
      success: true, 
      message: `Suscripción ${enabled ? 'activada' : 'desactivada'} correctamente` 
    }
  } catch (error: any) {
    console.error('Error toggling subscription:', error)
    throw new Error(`Error al actualizar suscripción: ${error.message}`)
  }
}

/**
 * Get all users with their subscription status
 */
export async function getUsersWithSubscriptions() {
  const session = await auth()
  
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized. Only administrators can view subscriptions.')
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        hasGoogleClassroomSubscription: true,
        createdAt: true,
        teacher: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return users
  } catch (error: any) {
    console.error('Error fetching users:', error)
    throw new Error(`Error al obtener usuarios: ${error.message}`)
  }
}
