# Sistema de Asistencia

Sistema completo de registro y seguimiento de asistencia para profesores y alumnos con autenticación mediante códigos QR y Google Classroom.

## 📋 Características

### **Para Profesores**
- ✅ Registro manual de asistencia diaria
- ✅ Estados: Presente, Ausente, Tarde, Justificado
- ✅ Justificación de ausencias
- ✅ Historial completo de asistencia
- ✅ Estadísticas anuales
- ✅ Ranking de mejor asistencia

### **Para Alumnos**
- ✅ Registro mediante escaneo de código QR
- ✅ Autenticación con Google Classroom (opcional)
- ✅ Validación por curso y fecha
- ✅ Códigos QR con expiración (15 minutos)
- ✅ Registro manual por profesores

### **Reportes**
- ✅ Ranking anual de asistencia de profesores
- ✅ Estadísticas por curso
- ✅ Porcentaje de asistencia
- ✅ Exportación de datos

## 🗄️ Modelos de Base de Datos

### **Student (Alumno)**
```prisma
model Student {
  id           String   @id @default(uuid())
  firstName    String
  lastName     String
  idNumber     String   @unique
  fileNumber   String
  birthdate    DateTime
  nationality  String
  address      String
  neighborhood String
  email        String?  @unique
  googleId     String?  @unique  // Para integración con Google Classroom
  courseId     String
  
  course             Course
  studentAttendances StudentAttendance[]
}
```

### **TeacherAttendance (Asistencia de Profesores)**
```prisma
model TeacherAttendance {
  id            String           @id @default(uuid())
  teacherId     String
  date          DateTime         @db.Date
  status        AttendanceStatus @default(PRESENT)
  justification String?
  
  teacher Teacher
}
```

### **StudentAttendance (Asistencia de Alumnos)**
```prisma
model StudentAttendance {
  id         String           @id @default(uuid())
  studentId  String
  courseId   String
  date       DateTime         @db.Date
  status     AttendanceStatus @default(PRESENT)
  verifiedBy String?          // Google ID de quien verificó
  qrCodeUsed Boolean          @default(false)
  
  student Student
  course  Course
}
```

### **AttendanceStatus (Estados)**
```prisma
enum AttendanceStatus {
  PRESENT    // Presente
  ABSENT     // Ausente
  LATE       // Tarde
  JUSTIFIED  // Justificado
}
```

## 🚀 Uso del Sistema

### **1. Registrar Asistencia de Profesores**

**Ubicación:** `/institutional/attendance/teachers`

1. Selecciona el profesor
2. Selecciona la fecha
3. Selecciona el estado (Presente, Ausente, Tarde, Justificado)
4. Si es ausente o justificado, agrega una justificación
5. Haz clic en "Registrar Asistencia"

**Permisos:** Solo administradores pueden registrar asistencia de profesores.

### **2. Generar Código QR para Alumnos**

**Ubicación:** `/institutional/attendance/students`

**Paso 1: Generar QR (Profesor)**
1. Selecciona el curso
2. Selecciona la fecha (normalmente hoy)
3. Haz clic en "Generar Código QR"
4. El código QR aparecerá en pantalla
5. Opcionalmente, descarga el QR para proyectarlo

**Paso 2: Escanear QR (Alumno)**
1. El alumno accede a `/institutional/attendance/students`
2. Hace clic en "Iniciar Escaneo"
3. Permite acceso a la cámara
4. Escanea el código QR mostrado por el profesor
5. La asistencia se registra automáticamente

**Validaciones:**
- El código QR expira en **15 minutos**
- El alumno debe estar inscrito en el curso
- Solo se puede marcar asistencia una vez por día
- Opcionalmente valida con Google Classroom

### **3. Ver Reportes de Asistencia**

**Ubicación:** `/institutional/attendance/reports`

**Información disponible:**
- 🏆 Ranking de profesores por asistencia
- 📊 Estadísticas detalladas (presente, ausente, tarde, justificado)
- 📈 Porcentaje de asistencia
- 🥇 Mejor asistencia del año
- 📉 Promedio general

**Cálculo del porcentaje:**
```
% Asistencia = ((Presente + Tarde) / Total Días) × 100
```

## 🔐 Autenticación con Google Classroom

### **Configuración**

1. El alumno debe tener su cuenta vinculada con Google Classroom
2. Al escanear el QR, el sistema verifica:
   - Identidad del alumno mediante Google ID
   - Inscripción en el curso
   - Validez del código QR

### **Flujo de Autenticación**

```
1. Alumno escanea QR
   ↓
2. Sistema extrae datos del QR (courseId, date, token)
   ↓
3. Valida expiración del token (15 min)
   ↓
4. Obtiene Google ID del alumno (si está conectado)
   ↓
5. Busca alumno por Google ID o courseId
   ↓
6. Verifica que el alumno pertenece al curso
   ↓
7. Registra asistencia con verifiedBy = Google ID
```

## 📊 API Endpoints

### **POST /api/attendance/qr/generate**
Genera un código QR para asistencia de alumnos.

**Request:**
```json
{
  "courseId": "uuid",
  "date": "2026-02-11T00:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "qrCode": "data:image/png;base64,..."
}
```

### **Server Actions**

**Profesores:**
- `markTeacherAttendance(teacherId, date, status, justification?)`
- `getTeacherAttendance(teacherId, startDate, endDate)`
- `getTeacherAttendanceStats(teacherId, year)`
- `getYearEndAttendanceReport(year)`

**Alumnos:**
- `markStudentAttendanceWithQR(qrDataString, studentGoogleId?)`
- `markStudentAttendanceManual(studentId, courseId, date, status)`
- `getStudentAttendance(studentId, startDate, endDate)`
- `getCourseAttendanceStats(courseId, year)`

## 🎨 Componentes UI

### **TeacherAttendanceForm**
Formulario para registrar asistencia de profesores.

```tsx
<TeacherAttendanceForm teachers={teachers} />
```

### **QRGenerator**
Genera códigos QR para asistencia de alumnos.

```tsx
<QRGenerator courses={courses} />
```

### **QRScanner**
Escanea códigos QR usando la cámara del dispositivo.

```tsx
<QRScanner />
```

## 📱 Uso en Dispositivos Móviles

El sistema está optimizado para dispositivos móviles:

- ✅ Escaneo de QR con cámara del celular
- ✅ Interfaz responsive
- ✅ Validación en tiempo real
- ✅ Notificaciones de éxito/error

**Recomendación:** Los alumnos pueden usar sus celulares para escanear el QR proyectado en clase.

## 🔒 Seguridad

### **Códigos QR**
- Token único generado con `crypto.randomBytes(32)`
- Expiración de 15 minutos
- Validación de fecha y curso
- No reutilizables

### **Permisos**
- Solo **ADMIN** puede registrar asistencia de profesores
- Solo **TEACHER** puede generar QR y registrar asistencia manual de alumnos
- Alumnos pueden auto-registrarse solo con QR válido

### **Validaciones**
- Un alumno solo puede marcar asistencia una vez por día
- El alumno debe estar inscrito en el curso del QR
- El QR debe estar vigente (no expirado)

## 📈 Reportes de Fin de Año

### **Informe de Profesores**

El sistema genera automáticamente un ranking de profesores ordenado por mejor asistencia:

```typescript
const report = await getYearEndAttendanceReport(2026)

// Resultado:
[
  {
    teacherId: "uuid",
    teacherName: "Angeles COPPIE",
    total: 180,
    present: 175,
    absent: 2,
    late: 3,
    justified: 0,
    attendanceRate: 98.89
  },
  // ... más profesores
]
```

### **Criterios de Evaluación**

- 🥇 **Excelente:** ≥ 95% de asistencia
- 🥈 **Bueno:** 85% - 94% de asistencia
- 🥉 **Regular:** < 85% de asistencia

## 🛠️ Mantenimiento

### **Limpiar datos antiguos**

Para eliminar registros de asistencia de años anteriores:

```typescript
await prisma.teacherAttendance.deleteMany({
  where: {
    date: {
      lt: new Date('2025-01-01')
    }
  }
})

await prisma.studentAttendance.deleteMany({
  where: {
    date: {
      lt: new Date('2025-01-01')
    }
  }
})
```

### **Backup de datos**

Recomendado hacer backup mensual de las tablas:
- `teacher_attendances`
- `student_attendances`

## 🐛 Solución de Problemas

### **El QR no escanea**

**Posibles causas:**
- Código expirado (> 15 minutos) → Generar nuevo QR
- Cámara sin permisos → Permitir acceso a cámara
- QR borroso → Aumentar tamaño o descargar imagen

### **"Student not found or not enrolled"**

**Solución:**
- Verificar que el alumno existe en la base de datos
- Verificar que el alumno está inscrito en el curso correcto
- Verificar que el Google ID coincide (si usa Google Classroom)

### **"QR code has expired"**

**Solución:**
- El código QR tiene una validez de 15 minutos
- Generar un nuevo código QR
- Los alumnos deben escanear inmediatamente

## 📚 Referencias

- [html5-qrcode Documentation](https://github.com/mebjas/html5-qrcode)
- [QRCode Library](https://github.com/soldair/node-qrcode)
- [Prisma Date Handling](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-dates)

## 🎯 Próximas Mejoras

- [ ] Notificaciones automáticas por email/SMS para ausencias
- [ ] Exportación de reportes a PDF/Excel
- [ ] Gráficos de tendencias de asistencia
- [ ] Integración con calendario escolar
- [ ] Alertas para profesores con baja asistencia
- [ ] Dashboard en tiempo real de asistencia del día
