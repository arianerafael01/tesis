# Configuración de Google Classroom API

Esta guía te ayudará a configurar la integración con Google Classroom para sincronizar profesores automáticamente.

## 📋 Requisitos previos

- Cuenta de Google Workspace for Education (o cuenta de administrador del dominio educativo)
- Acceso a Google Cloud Console
- Permisos de administrador en tu organización educativa

## 🚀 Pasos de configuración

### 1. Crear proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Nombra tu proyecto (ej: "Instituto Etchegoyen - Classroom Integration")

### 2. Habilitar Google Classroom API

1. En el menú lateral, ve a **APIs & Services** > **Library**
2. Busca "Google Classroom API"
3. Haz clic en **Enable** (Habilitar)

### 3. Configurar pantalla de consentimiento OAuth

1. Ve a **APIs & Services** > **OAuth consent screen**
2. Selecciona **Internal** (si usas Google Workspace) o **External**
3. Completa la información:
   - **App name**: Instituto Etchegoyen
   - **User support email**: Tu email
   - **Developer contact**: Tu email
4. En **Scopes**, agrega los siguientes permisos:
   - `https://www.googleapis.com/auth/classroom.courses.readonly`
   - `https://www.googleapis.com/auth/classroom.rosters.readonly`
   - `https://www.googleapis.com/auth/classroom.profile.emails`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`

### 4. Crear credenciales OAuth 2.0

1. Ve a **APIs & Services** > **Credentials**
2. Haz clic en **Create Credentials** > **OAuth client ID**
3. Selecciona **Web application**
4. Configura:
   - **Name**: Instituto Etchegoyen Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (desarrollo)
     - `https://tu-dominio.com` (producción)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/google/callback` (desarrollo)
     - `https://tu-dominio.com/api/auth/google/callback` (producción)
5. Haz clic en **Create**
6. **¡IMPORTANTE!** Guarda el **Client ID** y **Client Secret**

### 5. Configurar variables de entorno

Agrega las siguientes variables a tu archivo `.env`:

```env
# Google OAuth for Classroom API
GOOGLE_CLIENT_ID="tu-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="tu-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"
```

Para producción, actualiza `GOOGLE_REDIRECT_URI` con tu dominio real.

### 6. Aplicar migración de base de datos

Si aún no lo has hecho, ejecuta:

```bash
npx prisma migrate deploy
```

## 🎯 Uso de la integración

### Sincronizar profesores

1. Ve a la página de **Profesores** en tu aplicación
2. Verás una tarjeta "Sincronización con Google Classroom"
3. Haz clic en **Conectar con Google**
4. Autoriza la aplicación con tu cuenta de Google Workspace
5. Una vez conectado, haz clic en **Sincronizar Profesores**

### ¿Qué datos se importan?

La sincronización importa:

- ✅ **Nombre completo** del profesor
- ✅ **Email** institucional
- ✅ **Cursos** que enseña en Google Classroom
- ✅ **ID de Google** para vincular la cuenta

### Datos que NO se importan

- ❌ DNI / Número de identificación
- ❌ Dirección física
- ❌ Fecha de nacimiento
- ❌ Número de legajo

Estos datos se completan con valores por defecto y deben ser editados manualmente después.

## 🔐 Seguridad

- Las credenciales de Google se almacenan en cookies HTTP-only
- El token de acceso expira en 1 hora
- El refresh token se guarda por 30 días
- Las contraseñas de profesores importados se generan con bcrypt (por defecto: `profesor123`)

## ⚠️ Limitaciones

- **Cuota de API**: 10,000 requests por día (nivel gratuito)
- **Permisos**: Solo puedes acceder a cursos donde tengas permisos de profesor o administrador
- **Datos limitados**: Google Classroom no proporciona toda la información personal de los profesores

## 🔄 Sincronización automática

Actualmente la sincronización es manual. Para implementar sincronización automática:

1. Configura un cron job o scheduled task
2. Llama a `/api/sync/teachers` periódicamente
3. Considera usar webhooks de Google Classroom para actualizaciones en tiempo real

## 🐛 Solución de problemas

### Error: "No Google access token found"

**Solución**: Haz clic en "Conectar con Google" primero antes de sincronizar.

### Error: "Failed to sync teachers"

**Posibles causas**:
- Token expirado → Reconecta con Google
- Permisos insuficientes → Verifica los scopes en Google Cloud Console
- Cuota de API excedida → Espera 24 horas o solicita aumento de cuota

### Los profesores no aparecen

**Verifica**:
- Que tengas cursos activos en Google Classroom
- Que seas profesor o administrador de esos cursos
- Que los profesores tengan emails válidos

## 📚 Referencias

- [Google Classroom API Documentation](https://developers.google.com/classroom)
- [OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

## 🆘 Soporte

Si encuentras problemas, verifica:
1. Logs de la consola del navegador
2. Logs del servidor (terminal donde corre Next.js)
3. Variables de entorno correctamente configuradas
4. Credenciales de Google Cloud válidas
