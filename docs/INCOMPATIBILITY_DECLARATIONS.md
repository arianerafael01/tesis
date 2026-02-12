# Sistema de Declaraciones Juradas de Incompatibilidades

Sistema para gestionar los horarios en los que los profesores **NO PUEDEN** dictar clases porque trabajan en otras instituciones educativas.

## 📋 Concepto

Muchos profesores trabajan en múltiples escuelas. Para cumplir con las normativas, deben presentar una **Declaración Jurada de Incompatibilidades** que especifica los horarios en los que están ocupados en otras instituciones.

### **Lógica del Sistema:**

1. El profesor presenta su declaración jurada con los horarios **incompatibles** (donde NO puede dar clases)
2. El sistema automáticamente calcula la **disponibilidad** del profesor usando **lógica de negación**:
   - **Disponible** = Todos los horarios - Horarios incompatibles
3. La disponibilidad se genera automáticamente al cargar la declaración jurada

## 🗄️ Modelos de Base de Datos

### **IncompatibilityDeclaration**
```prisma
model IncompatibilityDeclaration {
  id              String   @id @default(uuid())
  teacherId       String
  documentUrl     String?  // URL del documento escaneado
  uploadedAt      DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  incompatibilities IncompatibilitySlot[]
  teacher           Teacher
}
```

### **IncompatibilitySlot**
```prisma
model IncompatibilitySlot {
  id            String   @id @default(uuid())
  declarationId String
  day           Day      // M, T, W, TH, F
  timeRange     String   // "Módulo 1 (7:30-8:10)"
  createdAt     DateTime @default(now())
  
  declaration IncompatibilityDeclaration
}
```

## 🚀 Uso del Sistema

### **1. Acceder a la Declaración Jurada**

**Ubicación:** Página de Profesores → Botón 📄 en la fila del profesor

1. En la tabla de profesores, haz clic en el botón de **documento** (📄)
2. Se abrirá el diálogo de "Declaración Jurada de Incompatibilidades"

### **2. Cargar Horarios Incompatibles**

El sistema ofrece **dos métodos** para cargar los horarios:

#### **Método 1: Detección Automática con OCR (Recomendado)**

1. **Escanear el documento:**
   - Haz clic en **"Escanear DDJJ"**
   - Toma una foto del documento o selecciona una imagen
   - El documento se mostrará como vista previa

2. **Auto-detectar horarios:**
   - Haz clic en **"Auto-detectar"** (botón con ✨)
   - El sistema procesará la imagen con OCR (Tesseract.js)
   - Verás una barra de progreso durante el procesamiento
   - Los horarios detectados se marcarán automáticamente en la grilla

3. **Revisar y ajustar:**
   - Verifica que los horarios detectados sean correctos
   - Agrega o quita horarios manualmente si es necesario
   - Los checkboxes permiten corrección manual

#### **Método 2: Entrada Manual**

1. **Marcar manualmente:**
   - Marca con checkboxes los horarios incompatibles
   - Donde el profesor NO puede dar clases
   - Representa cuando trabaja en otra institución

**Grilla de Horarios:**
- **Turno Mañana (TM):** 8 módulos (7:30-13:20)
- **Turno Tarde (TT):** 11 módulos (12:00-20:10)
- **Días:** Lunes a Viernes

**Guardar:**
- Haz clic en **"Guardar y Generar Disponibilidad"**

**Resultado:**
- ✅ Se guardan los horarios incompatibles
- ✅ Se almacena la imagen del documento escaneado
- ✅ Se genera automáticamente la disponibilidad del profesor
- ✅ La disponibilidad incluye TODOS los horarios NO marcados

### **3. Ejemplo Práctico**

**Caso:** Profesor trabaja en otra escuela los lunes y miércoles de 7:30 a 10:20

**Horarios incompatibles a marcar:**
- Lunes: Módulo 1, 2, 3, 4 (TM)
- Miércoles: Módulo 1, 2, 3, 4 (TM)

**Disponibilidad generada automáticamente:**
- Lunes: Módulo 5, 6, 7, 8 (TM) + Todos los módulos (TT)
- Martes: Todos los módulos (TM + TT)
- Miércoles: Módulo 5, 6, 7, 8 (TM) + Todos los módulos (TT)
- Jueves: Todos los módulos (TM + TT)
- Viernes: Todos los módulos (TM + TT)

## 🔄 Lógica de Negación

### **Fórmula:**
```
Disponibilidad = Todos los Horarios Posibles - Horarios Incompatibles
```

### **Todos los Horarios Posibles:**
- **Turno Mañana:** 8 módulos × 5 días = 40 slots
- **Turno Tarde:** 11 módulos × 5 días = 55 slots
- **Total:** 95 slots semanales

### **Ejemplo de Cálculo:**

Si un profesor tiene **10 horarios incompatibles**:
- Disponibilidad = 95 - 10 = **85 horarios disponibles**

## 📊 Funcionalidades

### **Server Actions**

**Crear Declaración:**
```typescript
await createIncompatibilityDeclaration(
  teacherId: string,
  incompatibleSlots: Array<{ day: Day, timeRange: string }>,
  documentUrl?: string
)
```

**Actualizar Declaración:**
```typescript
await updateIncompatibilityDeclaration(
  declarationId: string,
  incompatibleSlots: Array<{ day: Day, timeRange: string }>,
  documentUrl?: string
)
```

**Eliminar Declaración:**
```typescript
await deleteIncompatibilityDeclaration(declarationId: string)
```

**Obtener Declaración:**
```typescript
const declaration = await getIncompatibilityDeclaration(teacherId: string)
```

**Auto-generar Disponibilidad:**
```typescript
const result = await autoGenerateAvailability(teacherId: string)
// Retorna: { success: true, availabilitiesCreated: 85 }
```

## 🔐 Permisos

- Solo **ADMIN** puede gestionar declaraciones juradas
- Los profesores pueden ver su propia declaración (futuro)
- La disponibilidad se regenera automáticamente al modificar la declaración

## ⚠️ Reglas Importantes

### **1. Horarios Incompatibles = NO PUEDE DAR CLASES**
Los horarios marcados en la declaración jurada son **absolutos**. El profesor **NO PUEDE BAJO NINGUNA CIRCUNSTANCIA** dictar clases en esos horarios.

### **2. Regeneración Automática**
Cada vez que se modifica la declaración jurada:
1. Se eliminan todas las disponibilidades anteriores
2. Se recalculan las disponibilidades usando la lógica de negación
3. Se preservan las asignaciones de materias existentes (si no hay conflicto)

### **3. Validación de Asignaciones**
El sistema valida que:
- No se asignen materias en horarios incompatibles
- Las asignaciones existentes se respeten al regenerar disponibilidad
- Si hay conflicto, se notifica al administrador

## 🎨 Interfaz de Usuario

### **Componente Principal:**
`IncompatibilityDeclarationDialog`

**Características:**
- ✅ Grilla visual de todos los horarios
- ✅ Separación clara entre Turno Mañana y Tarde
- ✅ Checkboxes para marcar incompatibilidades
- ✅ Contador de horarios incompatibles seleccionados
- ✅ Advertencia clara sobre la lógica de negación
- ✅ Guardado y generación automática de disponibilidad

### **Botón en Tabla de Profesores:**
- Icono: 📄 (document-text)
- Ubicación: Columna de acciones
- Tooltip: "Declaración Jurada de Incompatibilidades"

## 📈 Flujo Completo

```
1. Admin abre diálogo de declaración jurada
   ↓
2. Marca horarios incompatibles (donde NO puede dar clases)
   ↓
3. Hace clic en "Guardar y Generar Disponibilidad"
   ↓
4. Sistema guarda incompatibilidades en BD
   ↓
5. Sistema calcula: Disponibilidad = Todos - Incompatibles
   ↓
6. Sistema elimina disponibilidades anteriores
   ↓
7. Sistema crea nuevas disponibilidades (solo horarios compatibles)
   ↓
8. Sistema muestra: "X horarios disponibles generados"
   ↓
9. Profesor ahora tiene disponibilidad correcta para asignaciones
```

## 🔍 Consultas Útiles

### **Ver Incompatibilidades de un Profesor:**
```typescript
const declaration = await prisma.incompatibilityDeclaration.findFirst({
  where: { teacherId: 'teacher-id' },
  include: {
    incompatibilities: true
  }
})
```

### **Contar Horarios Disponibles:**
```typescript
const availableCount = await prisma.availability.count({
  where: { teacherId: 'teacher-id' }
})
```

### **Ver Horarios Incompatibles por Día:**
```typescript
const mondayIncompatibilities = await prisma.incompatibilitySlot.findMany({
  where: {
    declaration: {
      teacherId: 'teacher-id'
    },
    day: 'M'
  }
})
```

## 🛠️ Mantenimiento

### **Actualizar Declaración Existente:**
1. El sistema detecta si ya existe una declaración
2. Muestra los horarios incompatibles previamente marcados
3. Permite modificar la selección
4. Regenera la disponibilidad al guardar

### **Eliminar Declaración:**
- Al eliminar una declaración, se regenera la disponibilidad completa
- El profesor quedará disponible en TODOS los horarios (95 slots)

## 📚 Casos de Uso

### **Caso 1: Profesor Nuevo**
1. Profesor presenta declaración jurada
2. Admin carga horarios incompatibles
3. Sistema genera disponibilidad automáticamente
4. Admin puede asignar materias en horarios disponibles

### **Caso 2: Cambio de Trabajo**
1. Profesor cambia de escuela secundaria
2. Admin actualiza declaración jurada
3. Sistema regenera disponibilidad
4. Asignaciones existentes se validan contra nueva disponibilidad

### **Caso 3: Profesor Tiempo Completo**
1. Profesor solo trabaja en esta institución
2. Admin NO marca ningún horario incompatible
3. Sistema genera disponibilidad completa (95 slots)
4. Máxima flexibilidad para asignaciones

## 🎯 Beneficios

- ✅ **Cumplimiento normativo:** Registro formal de incompatibilidades
- ✅ **Automatización:** Cálculo automático de disponibilidad
- ✅ **Prevención de errores:** No se pueden asignar materias en horarios incompatibles
- ✅ **Transparencia:** Visualización clara de horarios disponibles vs incompatibles
- ✅ **Eficiencia:** Ahorra tiempo al no tener que cargar manualmente cada horario disponible
- ✅ **Flexibilidad:** Fácil actualización cuando cambian las circunstancias del profesor

## 🤖 Tecnología OCR

### **Sistema Híbrido Implementado:**

El sistema utiliza **Tesseract.js** para reconocimiento óptico de caracteres (OCR):

**Características:**
- ✅ Procesamiento en el navegador (sin servidor)
- ✅ Soporte para español
- ✅ Barra de progreso en tiempo real
- ✅ Detección automática de horarios
- ✅ Corrección manual disponible

**Proceso de OCR:**
1. **Extracción de texto:** Tesseract.js lee el documento escaneado
2. **Parsing inteligente:** Detecta días (Lunes-Viernes) y horarios (HH:MM)
3. **Mapeo a módulos:** Convierte horarios a módulos del sistema
4. **Auto-selección:** Marca automáticamente los slots en la grilla
5. **Revisión manual:** Usuario puede ajustar resultados

**Precisión:**
- ⚠️ La precisión depende de la calidad de la imagen
- 💡 Recomendación: Foto clara, bien iluminada, sin sombras
- ✅ Siempre permite corrección manual

## 🔮 Mejoras Futuras

- [x] Subir documento escaneado de la declaración jurada
- [x] OCR para extraer horarios automáticamente del documento
- [ ] Mejorar precisión de OCR con preprocesamiento de imagen
- [ ] Detección de tablas con visión por computadora
- [ ] Notificaciones cuando hay conflictos con asignaciones existentes
- [ ] Historial de declaraciones juradas
- [ ] Exportar declaración a PDF
- [ ] Portal para que profesores carguen su propia declaración
- [ ] Integración con Google Cloud Vision API (mayor precisión)
