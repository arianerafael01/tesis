import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getUsersWithSubscriptions } from './actions'
import { SubscriptionsTable } from './subscriptions-table'

export default async function SubscriptionsPage() {
  const users = await getUsersWithSubscriptions()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Suscripciones</h1>
        <p className="text-muted-foreground mt-2">
          Administra las suscripciones premium de los usuarios del sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios y Suscripciones</CardTitle>
          <CardDescription>
            Activa o desactiva el acceso a funcionalidades premium como la sincronización con Google Classroom
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubscriptionsTable users={users} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Funcionalidades Premium</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold">Sincronización con Google Classroom</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Permite importar profesores y cursos automáticamente desde Google Classroom.
                  Esta funcionalidad requiere configuración de OAuth y credenciales de Google Cloud.
                </p>
              </div>
              <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                Premium
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
