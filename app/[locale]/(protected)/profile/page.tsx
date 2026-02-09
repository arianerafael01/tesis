import { getCurrentUser, canEditTeacherField } from "@/lib/permissions"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import TeacherProfileForm from "./teacher-profile-form"

export default async function ProfilePage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/es/auth/login")
  }

  // If user is a teacher, load their teacher data
  if (user.role === "TEACHER" && user.teacherId) {
    const teacher = await prisma.teacher.findUnique({
      where: { id: user.teacherId },
      include: {
        subjectsTeachers: {
          include: {
            subject: true,
            course: true
          }
        }
      }
    })

    if (!teacher) {
      return <div className="p-6">Error: No se encontró el perfil del profesor</div>
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mi Perfil</h2>
          <p className="text-muted-foreground">
            Actualiza tu información personal
          </p>
        </div>
        <TeacherProfileForm teacher={teacher} userId={user.id} />
      </div>
    )
  }

  // For admin users, redirect to dashboard
  redirect("/es/dashboard")
}
