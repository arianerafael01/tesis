'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { toggleGoogleClassroomSubscription } from './actions'
import { Icon } from '@iconify/react'

interface User {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'TEACHER'
  hasGoogleClassroomSubscription: boolean
  createdAt: Date
  teacher: {
    firstName: string
    lastName: string
  } | null
}

interface SubscriptionsTableProps {
  users: User[]
}

export function SubscriptionsTable({ users }: SubscriptionsTableProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const handleToggle = async (userId: string, currentState: boolean) => {
    setLoadingStates(prev => ({ ...prev, [userId]: true }))
    
    try {
      const result = await toggleGoogleClassroomSubscription(userId, !currentState)
      toast.success(result.message)
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar suscripción')
    } finally {
      setLoadingStates(prev => ({ ...prev, [userId]: false }))
    }
  }

  const getUserDisplayName = (user: User) => {
    if (user.teacher) {
      return `${user.teacher.firstName} ${user.teacher.lastName}`
    }
    return user.name || user.email
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Google Classroom</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No hay usuarios registrados
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {getUserDisplayName(user)}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge color={user.role === 'ADMIN' ? 'primary' : 'default'}>
                    {user.role === 'ADMIN' ? 'Administrador' : 'Profesor'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {user.hasGoogleClassroomSubscription ? (
                      <Badge color="success" className="gap-1">
                        <Icon icon="heroicons-outline:check-circle" className="w-3 h-3" />
                        Activa
                      </Badge>
                    ) : (
                      <Badge color="default" className="gap-1">
                        <Icon icon="heroicons-outline:x-circle" className="w-3 h-3" />
                        Inactiva
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm text-muted-foreground">
                      {user.hasGoogleClassroomSubscription ? 'Desactivar' : 'Activar'}
                    </span>
                    <Switch
                      checked={user.hasGoogleClassroomSubscription}
                      onCheckedChange={() => handleToggle(user.id, user.hasGoogleClassroomSubscription)}
                      disabled={loadingStates[user.id]}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
