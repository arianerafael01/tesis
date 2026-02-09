'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { updateTeacherProfile } from './actions'
import { useRouter } from '@/components/navigation'
import toast from 'react-hot-toast'

interface Teacher {
  id: string
  firstName: string
  lastName: string
  idNumber: string
  fileNumber: string
  birthdate: Date
  nationality: string
  address: string
  neighborhood: string
  subjectsTeachers: {
    subject: {
      id: string
      name: string
    }
    course: {
      id: string
      name: string
    }
  }[]
}

export default function TeacherProfileForm({ teacher, userId }: { teacher: Teacher, userId: string }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    
    try {
      await updateTeacherProfile(teacher.id, formData)
      toast.success('Perfil actualizado exitosamente')
      router.refresh()
    } catch (error) {
      toast.error('Error al actualizar el perfil')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Read-only fields */}
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={teacher.firstName} disabled />
              </div>

              <div className="space-y-2">
                <Label>Apellido</Label>
                <Input value={teacher.lastName} disabled />
              </div>

              <div className="space-y-2">
                <Label>DNI</Label>
                <Input value={teacher.idNumber} disabled />
              </div>

              <div className="space-y-2">
                <Label>Legajo</Label>
                <Input value={teacher.fileNumber} disabled />
              </div>

              <div className="space-y-2">
                <Label>Fecha de Nacimiento</Label>
                <Input 
                  value={new Date(teacher.birthdate).toLocaleDateString('es-AR')} 
                  disabled 
                />
              </div>

              <div className="space-y-2">
                <Label>Nacionalidad</Label>
                <Input value={teacher.nationality} disabled />
              </div>

              {/* Editable fields */}
              <div className="space-y-2">
                <Label htmlFor="address">Dirección *</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={teacher.address}
                  maxLength={100}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="neighborhood">Barrio *</Label>
                <Input
                  id="neighborhood"
                  name="neighborhood"
                  defaultValue={teacher.neighborhood}
                  maxLength={100}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Materias Asignadas</CardTitle>
        </CardHeader>
        <CardContent>
          {teacher.subjectsTeachers.length === 0 ? (
            <p className="text-muted-foreground">No tienes materias asignadas</p>
          ) : (
            <div className="space-y-2">
              {teacher.subjectsTeachers.map((st, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge color="primary">{st.subject.name}</Badge>
                  <span className="text-sm text-muted-foreground">en</span>
                  <Badge color="secondary">{st.course.name}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
