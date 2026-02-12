/**
 * Subscription utilities for premium features
 */

export interface SubscriptionFeatures {
  googleClassroomSync: boolean
}

/**
 * Check if user has access to Google Classroom sync feature
 */
export function hasGoogleClassroomAccess(user: { hasGoogleClassroomSubscription?: boolean } | null): boolean {
  if (!user) return false
  return user.hasGoogleClassroomSubscription === true
}

/**
 * Get all subscription features for a user
 */
export function getUserSubscriptionFeatures(user: { hasGoogleClassroomSubscription?: boolean } | null): SubscriptionFeatures {
  return {
    googleClassroomSync: hasGoogleClassroomAccess(user)
  }
}

/**
 * Premium feature messages
 */
export const SUBSCRIPTION_MESSAGES = {
  googleClassroomSync: {
    title: 'Función Premium',
    description: 'La sincronización con Google Classroom es una funcionalidad de pago. Contacta al administrador para activar esta función.',
    shortMessage: 'Requiere suscripción premium'
  }
}
