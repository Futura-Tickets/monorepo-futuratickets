# 📋 PASOS PARA CONFIGURAR GOOGLE CLOUD STORAGE

## ✅ Ya Completado

1. ✅ Desinstalado Azure Blob Storage
2. ✅ Instalado Google Cloud Storage SDK (`@google-cloud/storage`)
3. ✅ Creado servicio de Storage (`src/Storage/storage.service.ts`)
4. ✅ Creado módulo de Storage (`src/Storage/storage.module.ts`)
5. ✅ Creado interceptor de uploads (`src/Storage/storage.interceptor.ts`)
6. ✅ Actualizado `event.module.ts` para usar GCS
7. ✅ Actualizado `admin-event.controller.ts` con nuevo endpoint
8. ✅ Actualizado validación de variables de entorno
9. ✅ Actualizado archivo `.env` con variables GCS

## 🔧 PASOS PENDIENTES (Para que funcione)

### Paso 1: Crear Proyecto en Google Cloud Platform

1. Ve a: https://console.cloud.google.com
2. Click en el selector de proyectos (arriba a la izquierda)
3. Click "NEW PROJECT"
4. Nombre del proyecto: `futuratickets-dev` (o el que prefieras)
5. Click "CREATE"
6. **Anota el Project ID** que aparece (puede ser diferente al nombre)

### Paso 2: Habilitar la API de Cloud Storage

1. En el menú lateral, ve a **APIs & Services > Library**
2. Busca "Cloud Storage API"
3. Click en "Cloud Storage API"
4. Click "ENABLE"

### Paso 3: Crear un Bucket de Storage

Opción A - Desde la Consola Web:
1. En el menú lateral, ve a **Cloud Storage > Buckets**
2. Click "CREATE BUCKET"
3. Configuración:
   - **Name**: `futuratickets-dev-images` (debe ser único globalmente)
   - **Location type**: Region
   - **Location**: `europe-west1` (Madrid) o `us-central1` (USA)
   - **Storage class**: Standard
   - **Access control**: Uniform
   - **Public access**: "Prevent public access" por ahora
4. Click "CREATE"

Opción B - Desde gcloud CLI:
```bash
# Instalar gcloud CLI primero si no lo tienes
# https://cloud.google.com/sdk/docs/install

# Crear bucket
gcloud storage buckets create gs://futuratickets-dev-images \
  --project=TU_PROJECT_ID \
  --location=europe-west1 \
  --uniform-bucket-level-access
```

### Paso 4: Crear Service Account

1. En el menú lateral, ve a **IAM & Admin > Service Accounts**
2. Click "CREATE SERVICE ACCOUNT"
3. Configuración:
   - **Service account name**: `futuratickets-storage`
   - **Service account ID**: (se genera automáticamente)
   - **Description**: `Service account para subir imágenes a Cloud Storage`
4. Click "CREATE AND CONTINUE"
5. En "Grant this service account access to project":
   - Busca y selecciona el rol: **Storage Object Admin**
6. Click "CONTINUE"
7. Click "DONE"

### Paso 5: Crear y Descargar la Clave JSON

1. En la lista de Service Accounts, encuentra `futuratickets-storage`
2. Click en los tres puntos (⋮) a la derecha
3. Click "Manage keys"
4. Click "ADD KEY" > "Create new key"
5. Selecciona "JSON"
6. Click "CREATE"
7. Se descargará un archivo JSON (guárdalo bien, ¡no lo compartas!)

### Paso 6: Configurar la Clave en el Proyecto

1. Crea la carpeta `config` en la raíz del proyecto:
```bash
mkdir -p config
```

2. Mueve el archivo JSON descargado a esta carpeta:
```bash
# Ejemplo si está en Downloads
mv ~/Downloads/futuratickets-dev-*.json ./config/gcs-service-account-key.json
```

3. **IMPORTANTE**: Asegúrate de que `config/` esté en `.gitignore`:
```bash
echo "config/" >> .gitignore
```

### Paso 7: Actualizar Variables de Entorno

Edita el archivo `.env` y reemplaza estos valores:

```bash
# Google Cloud Storage
GCS_PROJECT_ID=tu-project-id-real       # El Project ID de GCP
GCS_BUCKET_NAME=futuratickets-dev-images  # El nombre de tu bucket
GCS_KEY_FILE=./config/gcs-service-account-key.json  # Ruta al JSON
```

**Ejemplo real:**
```bash
GCS_PROJECT_ID=futuratickets-dev-123456
GCS_BUCKET_NAME=futuratickets-dev-images
GCS_KEY_FILE=./config/gcs-service-account-key.json
```

### Paso 8: Verificar la Configuración

Ejecuta este comando para verificar que todo está bien:

```bash
npm run start:dev
```

Deberías ver en los logs:
```
✅ Environment variables validated successfully
[Nest] ... StorageService initialized
```

### Paso 9: Probar el Upload

Prueba subir una imagen usando curl:

```bash
# Primero necesitas obtener un JWT token de autenticación
# (debes hacer login como promoter primero)

curl -X POST http://localhost:3004/admin/events/upload \
  -H "Authorization: Bearer TU_JWT_TOKEN" \
  -F "file=@ruta/a/tu/imagen.jpg"
```

Respuesta esperada:
```json
{
  "url": "https://storage.googleapis.com/futuratickets-dev-images/1234567890-abc123.jpg",
  "filename": "1234567890-abc123.jpg"
}
```

### Paso 10: (Opcional) Hacer el Bucket Público

Si quieres que las imágenes sean accesibles sin autenticación:

```bash
# Opción 1: gcloud CLI
gsutil iam ch allUsers:objectViewer gs://futuratickets-dev-images

# Opción 2: Desde la consola
# 1. Ve al bucket en Cloud Storage
# 2. Click en "PERMISSIONS"
# 3. Click "GRANT ACCESS"
# 4. Principal: allUsers
# 5. Role: Storage Object Viewer
# 6. Click "SAVE"
```

## 🔍 Verificar que Todo Funciona

### Checklist Final:

- [ ] Proyecto GCP creado
- [ ] API de Cloud Storage habilitada
- [ ] Bucket creado
- [ ] Service Account creado con rol "Storage Object Admin"
- [ ] Clave JSON descargada y guardada en `./config/`
- [ ] Variables de entorno actualizadas en `.env`
- [ ] Servidor arranca sin errores
- [ ] Endpoint `/admin/events/upload` responde correctamente
- [ ] Las imágenes se suben al bucket

## 📊 Estado Actual del Código

### Archivos Creados/Modificados:

```
src/Storage/
├── storage.service.ts         ✅ Servicio GCS completo
├── storage.module.ts          ✅ Módulo NestJS
└── storage.interceptor.ts     ✅ Interceptor para uploads

src/Event/
├── event.module.ts            ✅ Actualizado (GCS en lugar de Azure)
└── admin-event.controller.ts  ✅ Endpoint /upload actualizado

src/config/
└── env.validation.ts          ✅ Validación GCS

.env                           ✅ Variables GCS configuradas (placeholder)

MIGRATION_AZURE_TO_GCS.md     ✅ Guía completa de migración
```

### Estructura del Servicio de Storage:

```typescript
// Métodos disponibles en StorageService:

uploadFile(file, filename, contentType)
// Sube un archivo y devuelve la URL pública

deleteFile(filename)
// Elimina un archivo del bucket

getSignedUrl(filename, expiresIn)
// Genera una URL firmada temporal (para acceso privado)

fileExists(filename)
// Verifica si existe un archivo
```

## 🚨 Errores Comunes

### Error: "GCS_PROJECT_ID is required"
**Solución**: Actualiza el `.env` con tu Project ID real

### Error: "Could not load the default credentials"
**Solución**: Verifica que el archivo JSON existe en la ruta especificada en `GCS_KEY_FILE`

### Error: "Permission denied"
**Solución**: Asegúrate de que el Service Account tiene el rol "Storage Object Admin"

### Error: "Bucket does not exist"
**Solución**: Verifica que el nombre del bucket en `GCS_BUCKET_NAME` coincide exactamente con el creado en GCP

### Error al subir: "File too large"
**Solución**: Configura límites en Multer si necesitas archivos grandes:
```typescript
// En event.module.ts
MulterModule.register({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  }
})
```

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs del servidor: `npm run start:dev`
2. Verifica que todas las variables de entorno están correctas
3. Comprueba los permisos del Service Account en GCP
4. Consulta la documentación completa en `MIGRATION_AZURE_TO_GCS.md`

## 🎯 Próximos Pasos Opcionales

Una vez que todo funcione:

1. **Migrar imágenes existentes de Azure** (si las hay)
   - Ver script en `MIGRATION_AZURE_TO_GCS.md`

2. **Configurar CDN** para mejorar performance
   - Cloud CDN de Google Cloud

3. **Implementar compresión de imágenes**
   - Sharp.js para optimizar antes de subir

4. **Añadir validación de tipos de archivo**
   - Solo permitir jpg, png, webp, etc.

5. **Implementar límites de tamaño**
   - Validar tamaño antes de upload
