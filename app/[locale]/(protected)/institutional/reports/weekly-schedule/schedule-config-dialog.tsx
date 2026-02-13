'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icon } from '@/components/ui/icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useRouter } from '@/components/navigation'
import { createScheduleConfig, updateScheduleConfig, deleteScheduleConfig, toggleScheduleConfigActive } from './schedule-config-actions'
import { Shift } from '@/lib/generated/prisma'

interface ScheduleConfig {
  id: string
  name: string
  shift: Shift
  startTime: string
  isActive: boolean
  modules: {
    id: string
    moduleNumber: number
    startTime: string
    endTime: string
  }[]
  breaks: {
    id: string
    afterModule: number
    durationMinutes: number
  }[]
}

interface ScheduleConfigDialogProps {
  configs: ScheduleConfig[]
}

export function ScheduleConfigDialog({ configs }: ScheduleConfigDialogProps) {
  const [open, setOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<ScheduleConfig | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    shift: 'MorningShift' as Shift,
    startTime: '7:30',
    totalModules: 8,
    breaks: [{ afterModule: 2, durationMinutes: 10 }],
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingConfig) {
      const result = await updateScheduleConfig(editingConfig.id, {
        name: formData.name,
        startTime: formData.startTime,
        totalModules: formData.totalModules,
        breaks: formData.breaks,
      })

      if (result.success) {
        toast.success('Configuración actualizada correctamente')
        setOpen(false)
        setEditingConfig(null)
        resetForm()
        router.refresh()
      } else {
        toast.error(result.error || 'Error al actualizar configuración')
      }
    } else {
      const result = await createScheduleConfig(formData)

      if (result.success) {
        toast.success('Configuración creada correctamente')
        setOpen(false)
        resetForm()
        router.refresh()
      } else {
        toast.error(result.error || 'Error al crear configuración')
      }
    }
  }

  const handleEdit = (config: ScheduleConfig) => {
    setEditingConfig(config)
    setFormData({
      name: config.name,
      shift: config.shift,
      startTime: config.startTime,
      totalModules: config.modules.length,
      breaks: config.breaks.map((b) => ({ afterModule: b.afterModule, durationMinutes: b.durationMinutes })),
    })
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta configuración?')) return

    const result = await deleteScheduleConfig(id)
    if (result.success) {
      toast.success('Configuración eliminada correctamente')
      router.refresh()
    } else {
      toast.error(result.error || 'Error al eliminar configuración')
    }
  }

  const handleToggleActive = async (id: string) => {
    const result = await toggleScheduleConfigActive(id)
    if (result.success) {
      toast.success('Estado actualizado correctamente')
      router.refresh()
    } else {
      toast.error(result.error || 'Error al actualizar estado')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      shift: 'MorningShift',
      startTime: '7:30',
      totalModules: 8,
      breaks: [{ afterModule: 2, durationMinutes: 10 }],
    })
  }

  const addBreak = () => {
    setFormData({
      ...formData,
      breaks: [...formData.breaks, { afterModule: formData.breaks.length + 2, durationMinutes: 10 }],
    })
  }

  const removeBreak = (index: number) => {
    setFormData({
      ...formData,
      breaks: formData.breaks.filter((_, i) => i !== index),
    })
  }

  const updateBreak = (index: number, field: 'afterModule' | 'durationMinutes', value: number) => {
    const newBreaks = [...formData.breaks]
    newBreaks[index][field] = value
    setFormData({ ...formData, breaks: newBreaks })
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) {
        setEditingConfig(null)
        resetForm()
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Icon icon="heroicons:cog-6-tooth" className="h-4 w-4" />
          Configurar Horarios
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuración de Horarios de la Grilla Semanal</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Configurations */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Configuraciones Existentes</h3>
            <div className="grid gap-3">
              {configs.map((config) => (
                <Card key={config.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{config.name}</CardTitle>
                        {config.isActive && <Badge color="success">Activa</Badge>}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(config)}>
                          <Icon icon="heroicons:pencil" className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleToggleActive(config.id)}>
                          <Icon icon={config.isActive ? "heroicons:eye-slash" : "heroicons:eye"} className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" color="destructive" onClick={() => handleDelete(config.id)}>
                          <Icon icon="heroicons:trash" className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1">
                      <p><strong>Turno:</strong> {config.shift === 'MorningShift' ? 'Mañana' : 'Tarde'}</p>
                      <p><strong>Hora de inicio:</strong> {config.startTime}</p>
                      <p><strong>Módulos:</strong> {config.modules.length}</p>
                      <p><strong>Recreos:</strong> {config.breaks.length > 0 ? config.breaks.map(b => `${b.durationMinutes}min después del módulo ${b.afterModule}`).join(', ') : 'Sin recreos'}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Create/Edit Form */}
          <div>
            <h3 className="text-sm font-semibold mb-3">{editingConfig ? 'Editar Configuración' : 'Nueva Configuración'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Turno Mañana"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shift">Turno</Label>
                  <Select value={formData.shift} onValueChange={(value) => setFormData({ ...formData, shift: value as Shift })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MorningShift">Mañana</SelectItem>
                      <SelectItem value="LateShift">Tarde</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime">Hora de Inicio</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalModules">Cantidad de Módulos</Label>
                  <Input
                    id="totalModules"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.totalModules}
                    onChange={(e) => setFormData({ ...formData, totalModules: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Recreos (cada módulo es de 40 minutos)</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addBreak}>
                    <Icon icon="heroicons:plus" className="h-4 w-4 mr-1" />
                    Agregar Recreo
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.breaks.map((breakItem, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs">Después del módulo</Label>
                        <Input
                          type="number"
                          min="1"
                          max={formData.totalModules - 1}
                          value={breakItem.afterModule}
                          onChange={(e) => updateBreak(index, 'afterModule', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs">Duración (minutos)</Label>
                        <Input
                          type="number"
                          min="5"
                          max="60"
                          value={breakItem.durationMinutes}
                          onChange={(e) => updateBreak(index, 'durationMinutes', parseInt(e.target.value))}
                        />
                      </div>
                      <Button type="button" size="sm" variant="outline" color="destructive" onClick={() => removeBreak(index)}>
                        <Icon icon="heroicons:trash" className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  setOpen(false)
                  setEditingConfig(null)
                  resetForm()
                }}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingConfig ? 'Actualizar' : 'Crear'} Configuración
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
