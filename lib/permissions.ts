import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export type UserRole = "ADMIN" | "TEACHER"

export interface UserWithRole {
  id: string
  email: string
  name: string | null
  role: UserRole
  teacherId: string | null
}

export async function getCurrentUser(): Promise<UserWithRole | null> {
  const session = await auth()
  if (!session?.user?.email) return null

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      teacherId: true,
    },
  })

  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  if (user.role !== "ADMIN") {
    throw new Error("Forbidden: Admin access required")
  }
  return user
}

export async function requireTeacher() {
  const user = await requireAuth()
  if (user.role !== "TEACHER") {
    throw new Error("Forbidden: Teacher access required")
  }
  return user
}

export function isAdmin(user: UserWithRole): boolean {
  return user.role === "ADMIN"
}

export function isTeacher(user: UserWithRole): boolean {
  return user.role === "TEACHER"
}

export function canEditTeacher(user: UserWithRole, teacherId: string): boolean {
  // Admin can edit any teacher
  if (user.role === "ADMIN") return true
  
  // Teacher can only edit their own profile (limited fields)
  if (user.role === "TEACHER" && user.teacherId === teacherId) return true
  
  return false
}

export function canEditTeacherField(user: UserWithRole, teacherId: string, field: string): boolean {
  // Admin can edit all fields
  if (user.role === "ADMIN") return true
  
  // Teacher can only edit address and neighborhood of their own profile
  const allowedFields = ["address", "neighborhood"]
  if (user.role === "TEACHER" && user.teacherId === teacherId && allowedFields.includes(field)) {
    return true
  }
  
  return false
}

export function canAccessCourses(user: UserWithRole): boolean {
  return user.role === "ADMIN"
}

export function canAccessSubjects(user: UserWithRole): boolean {
  return user.role === "ADMIN"
}

export function canAccessClassrooms(user: UserWithRole): boolean {
  return user.role === "ADMIN"
}

export function canViewReports(user: UserWithRole): boolean {
  // Both admin and teacher can view reports
  return true
}

export function canEditReports(user: UserWithRole): boolean {
  // Only admin can edit reports (assign subjects, etc.)
  return user.role === "ADMIN"
}
