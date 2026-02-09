import { getCurrentUser, UserRole } from "@/lib/permissions"
import { redirect } from "next/navigation"

interface RoleGateProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  redirectTo?: string
}

export async function RoleGate({ children, allowedRoles, redirectTo = "/es/dashboard" }: RoleGateProps) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/es/auth/login")
  }
  
  if (!allowedRoles.includes(user.role)) {
    redirect(redirectTo)
  }
  
  return <>{children}</>
}
