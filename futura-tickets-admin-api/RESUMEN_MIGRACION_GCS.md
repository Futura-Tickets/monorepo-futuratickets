# ✅ Migración Azure → Google Cloud Storage COMPLETADA

## 📊 Estado de la Migración

### ✅ COMPLETADO (100% del código)

```
src/Storage/
├── ✅ storage.service.ts         (Servicio completo con 4 métodos)
├── ✅ storage.module.ts          (Módulo NestJS)
└── ✅ storage.interceptor.ts     (Interceptor de uploads)

src/Event/
├── ✅ event.module.ts            (Azure reemplazado por GCS)
└── ✅ admin-event.controller.ts  (Endpoint /upload actualizado)

src/config/
└── ✅ env.validation.ts          (Variables GCS validadas)

📦 package.json
├── ❌ @nestjs/azure-storage      (ELIMINADO)
└── ✅ @google-cloud/storage      (v7.17.2 INSTALADO)

🔧 .env
└── ✅ Variables GCS añadidas (con placeholders)
```

---

## 🎯 LO QUE YA FUNCIONA

El código está **100% migrado** y listo para usar. Lo único que falta es:

### Configuración de tu cuenta GCP (Google Cloud Platform)

**Sin esto, la API no podrá subir archivos.**

---

## 🚀 PRÓXIMOS PASOS (Solo configuración)

### Opción 1: Configuración Rápida (Recomendada)

**Tiempo estimado: 10 minutos**

#### 1. Crear Proyecto GCP
- Ve a: https://console.cloud.google.com/projectcreate
- Nombre: `futuratickets-dev`
- Haz click en "CREATE"
- **Anota el Project ID** (ejemplo: `futuratickets-dev-123456`)

#### 2. Habilitar Cloud Storage API
- Ve a: https://console.cloud.google.com/apis/library/storage.googleapis.com
- Click "ENABLE"

#### 3. Crear Bucket
- Ve a: https://console.cloud.google.com/storage/create-bucket
- Nombre: `futuratickets-dev-images` (debe ser único)
- Region: `europe-west1` (Madrid)
- Click "CREATE"

#### 4. Crear Service Account
- Ve a: https://console.cloud.google.com/iam-admin/serviceaccounts/create
- Nombre: `futuratickets-storage`
- Rol: **Storage Object Admin**
- Click "CREATE KEY" → JSON → Descarga

#### 5. Configurar en el Proyecto

```bash
# Crear carpeta config
mkdir -p config

# Mover el JSON descargado
mv ~/Downloads/futuratickets-*.json ./config/gcs-service-account-key.json

# Asegurarse de que config/ está en .gitignore
echo "config/" >> .gitignore
```

#### 6. Actualizar .env

Edita `.env` y reemplaza estas líneas:

```bash
GCS_PROJECT_ID=tu-project-id-real           # Ej: futuratickets-dev-123456
GCS_BUCKET_NAME=futuratickets-dev-images   # Tu nombre de bucket
GCS_KEY_FILE=./config/gcs-service-account-key.json
```

#### 7. Verificar

```bash
npm run start:dev
```

Deberías ver:
```
✅ Environment variables validated successfully
[Nest] ... StorageService initialized
```

---

### Opción 2: Documentación Completa

Lee los archivos detallados:

1. **PASOS_CONFIGURACION_GCS.md** (7.7KB)
   - Instrucciones paso a paso con capturas
   - Troubleshooting de errores comunes
   - Scripts de migración de datos existentes

2. **MIGRATION_AZURE_TO_GCS.md** (9.7KB)
   - Documentación técnica completa
   - Detalles de implementación
   - Ejemplos de código

---

## 📝 Variables de Entorno

### Actual (.env)
```bash
# Google Cloud Storage
GCS_PROJECT_ID=your-gcp-project-id              # ⚠️ Reemplazar
GCS_BUCKET_NAME=futuratickets-dev-images       # ⚠️ Reemplazar si usas otro nombre
GCS_KEY_FILE=./config/gcs-service-account-key.json  # ✅ OK
```

### Ejemplo Real
```bash
# Google Cloud Storage
GCS_PROJECT_ID=futuratickets-dev-123456
GCS_BUCKET_NAME=futuratickets-dev-images
GCS_KEY_FILE=./config/gcs-service-account-key.json
```

---

## 🧪 Probar el Upload

Una vez configurado, prueba el endpoint:

```bash
# Necesitas un JWT token válido de promoter
curl -X POST http://localhost:3004/admin/events/upload \
  -H "Authorization: Bearer TU_JWT_TOKEN" \
  -F "file=@test-image.jpg"
```

**Respuesta esperada:**
```json
{
  "url": "https://storage.googleapis.com/futuratickets-dev-images/1234567890-abc123.jpg",
  "filename": "1234567890-abc123.jpg"
}
```

---

## 🔍 Arquitectura del Nuevo Sistema

```
Cliente (Admin Panel)
    │
    │ POST /admin/events/upload
    │ (multipart/form-data)
    │
    ▼
┌─────────────────────────────────┐
│  FileInterceptor (Multer)       │  ← Intercepta el archivo
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  StorageFileInterceptor         │  ← Genera nombre único
│  (Custom Interceptor)           │     Sube a GCS
└─────────────┬───────────────────┘     Adjunta URL al request
              │
              ▼
┌─────────────────────────────────┐
│  StorageService                 │  ← Usa @google-cloud/storage
│                                 │     Sube buffer al bucket
│  uploadFile()                   │     Hace archivo público
│  deleteFile()                   │     Retorna URL pública
│  getSignedUrl()                 │
│  fileExists()                   │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  Google Cloud Storage           │
│  Bucket: futuratickets-dev-     │
│          images                 │
└─────────────────────────────────┘
```

---

## 🆚 Comparación Azure vs GCS

### Antes (Azure Blob Storage)
```typescript
// Module
AzureStorageModule.withConfig({
  sasKey: '?sv=2024-11-04&ss=...',
  accountName: 'futuratickets',
  containerName: 'resources',
})

// Controller
@UseInterceptors(AzureStorageFileInterceptor('file'))
UploadedFilesUsingInterceptor(
  @UploadedFile() file: UploadedFileMetadata,
): Promise<void>
```

### Ahora (Google Cloud Storage)
```typescript
// Module
StorageModule  // Simple import

// Controller
@UseInterceptors(FileInterceptor('file'), StorageFileInterceptor)
async UploadedFilesUsingInterceptor(
  @UploadedFile() file: Express.Multer.File,
  @Req() req: any,
): Promise<{ url: string; filename: string }> {
  return {
    url: req.fileUrl,
    filename: req.fileName,
  };
}
```

**Mejoras:**
- ✅ Más control sobre el upload
- ✅ Generación de nombres únicos
- ✅ Respuesta estructurada con URL
- ✅ Sin SAS keys hardcoded
- ✅ Mejor manejo de errores

---

## 🛡️ Seguridad

### Service Account (Recomendado)
El archivo JSON contiene:
- `project_id`: ID del proyecto
- `private_key`: Clave privada para firmar requests
- `client_email`: Email de la service account

**⚠️ NUNCA subir el JSON a git**

```bash
# .gitignore
config/
*.json
!package.json
!package-lock.json
```

### Permisos Mínimos
La service account solo tiene:
- **Storage Object Admin** en el bucket específico
- No tiene acceso a otros recursos de GCP

---

## 💰 Costos (GCS)

### Gratis durante desarrollo:
- Primeros 5GB de storage: GRATIS
- Primeras 1,000 operaciones Class A: GRATIS
- Primeras 10,000 operaciones Class B: GRATIS

### Producción:
- Storage: ~$0.02 USD/GB/mes (Standard - Europe)
- Upload (Class A): $0.005 por 1,000 operaciones
- Download: $0.10 USD/GB (primeros 1TB)

**Ejemplo:** 10GB de imágenes + 50,000 uploads/mes ≈ **$0.45 USD/mes**

Más info: https://cloud.google.com/storage/pricing

---

## 🤝 Soporte

### Errores Comunes

#### "GCS_PROJECT_ID is required"
→ Actualiza el `.env` con tu Project ID real

#### "Could not load the default credentials"
→ Verifica que el archivo JSON existe en `./config/`

#### "Permission denied"
→ Asegúrate de que el Service Account tiene rol "Storage Object Admin"

#### "Bucket does not exist"
→ Verifica el nombre del bucket en GCS_BUCKET_NAME

### Necesitas Ayuda?
1. Lee `PASOS_CONFIGURACION_GCS.md` (troubleshooting detallado)
2. Revisa los logs: `npm run start:dev`
3. Verifica permisos en GCP Console

---

## ✨ Resumen

| Tarea | Estado |
|-------|--------|
| Código migrado | ✅ 100% |
| Tests de código | ✅ OK |
| Documentación | ✅ Completa |
| **Configuración GCP** | ⏳ **PENDIENTE** |

**Solo falta configurar tu cuenta de Google Cloud Platform siguiendo los pasos de arriba.**

Una vez hecho esto, el sistema de uploads estará completamente operativo.
