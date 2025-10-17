# Migración de Azure Blob Storage a Google Cloud Storage

Este documento describe la migración del sistema de almacenamiento de Azure Blob Storage a Google Cloud Storage (GCS) en la API de administración de Futura Tickets.

## Resumen de Cambios

La migración reemplaza completamente la integración con Azure Blob Storage por Google Cloud Storage para el manejo de archivos (principalmente imágenes de eventos).

### Archivos Modificados

1. **src/Storage/storage.service.ts** - Nuevo servicio GCS
2. **src/Storage/storage.module.ts** - Nuevo módulo GCS
3. **src/Storage/storage.interceptor.ts** - Nuevo interceptor para uploads
4. **src/Event/event.module.ts** - Reemplazo de Azure por GCS
5. **src/Event/admin-event.controller.ts** - Actualización del endpoint de upload
6. **src/config/env.validation.ts** - Validación de variables GCS
7. **.env** - Nuevas variables de entorno GCS

### Dependencias

**Eliminadas:**
- `@nestjs/azure-storage`
- `@azure/storage-blob`

**Añadidas:**
- `@google-cloud/storage` (^7.14.0)

## Configuración de Google Cloud Storage

### 1. Crear Proyecto en GCP

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Anota el **Project ID**

### 2. Crear Bucket de Storage

```bash
# Opción 1: Desde la consola web
# Ve a Cloud Storage → Buckets → Create Bucket

# Opción 2: Desde gcloud CLI
gcloud storage buckets create gs://futuratickets-dev-images \
  --project=your-project-id \
  --location=europe-west1 \
  --uniform-bucket-level-access
```

**Configuración recomendada:**
- **Location type:** Region (europe-west1 para menor latencia en Europa)
- **Storage class:** Standard
- **Access control:** Uniform (recommended)
- **Public access:** Prevenir acceso público por defecto

### 3. Crear Service Account

1. Ve a IAM & Admin → Service Accounts
2. Click "Create Service Account"
3. Nombre: `futuratickets-storage`
4. Rol: `Storage Object Admin`
5. Click "Create and Continue"
6. Click "Create Key" → JSON
7. Descarga el archivo JSON

### 4. Configurar Variables de Entorno

Actualiza el archivo `.env`:

```bash
# Google Cloud Storage
GCS_PROJECT_ID=your-gcp-project-id
GCS_BUCKET_NAME=futuratickets-dev-images
GCS_KEY_FILE=./config/gcs-service-account-key.json
```

**Importante:** Guarda el archivo JSON descargado en la ruta especificada en `GCS_KEY_FILE`.

### 5. Configurar Permisos del Bucket (Opcional)

Si necesitas que las imágenes sean accesibles públicamente:

```bash
# Hacer el bucket público
gsutil iam ch allUsers:objectViewer gs://futuratickets-dev-images
```

O desde la consola:
1. Ve al bucket
2. Permissions → Add Principal
3. Principal: `allUsers`
4. Role: `Storage Object Viewer`

## Implementación Técnica

### StorageService

El nuevo servicio en `src/Storage/storage.service.ts` proporciona los siguientes métodos:

```typescript
// Subir archivo
async uploadFile(
  file: Buffer | NodeJS.ReadableStream,
  filename: string,
  contentType: string
): Promise<string>

// Eliminar archivo
async deleteFile(filename: string): Promise<void>

// Obtener URL firmada (acceso temporal)
async getSignedUrl(filename: string, expiresIn?: number): Promise<string>

// Verificar si existe un archivo
async fileExists(filename: string): Promise<boolean>
```

### StorageFileInterceptor

El interceptor personalizado en `src/Storage/storage.interceptor.ts`:

- Intercepta archivos subidos vía `FileInterceptor('file')`
- Genera nombres únicos: `{timestamp}-{random}.{extension}`
- Sube a GCS automáticamente
- Adjunta `fileUrl` y `fileName` al request
- Maneja errores con `BadRequestException`

### Endpoint de Upload

El endpoint actualizado en `src/Event/admin-event.controller.ts`:

```typescript
@Post('/upload')
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

## Migración de Datos Existentes

Si tienes imágenes existentes en Azure Blob Storage que necesitas migrar a GCS:

### Opción 1: Script Manual

```bash
# Instalar gsutil
pip install gsutil

# Configurar Azure CLI
az login

# Descargar de Azure
az storage blob download-batch \
  --account-name futuratickets \
  --source images \
  --destination ./temp-images

# Subir a GCS
gsutil -m cp -r ./temp-images/* gs://futuratickets-dev-images/

# Limpiar
rm -rf ./temp-images
```

### Opción 2: Script de Node.js

Crear un script `scripts/migrate-images.ts`:

```typescript
import { Storage } from '@google-cloud/storage';
import { BlobServiceClient } from '@azure/storage-blob';

async function migrateImages() {
  // Configurar Azure
  const azureClient = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING
  );
  const containerClient = azureClient.getContainerClient('images');

  // Configurar GCS
  const storage = new Storage({
    projectId: process.env.GCS_PROJECT_ID,
    keyFilename: process.env.GCS_KEY_FILE,
  });
  const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

  // Listar y migrar
  for await (const blob of containerClient.listBlobsFlat()) {
    console.log(`Migrando: ${blob.name}`);

    const blobClient = containerClient.getBlobClient(blob.name);
    const downloadResponse = await blobClient.download();
    const buffer = await streamToBuffer(downloadResponse.readableStreamBody);

    await bucket.file(blob.name).save(buffer, {
      contentType: blob.properties.contentType,
    });
  }

  console.log('Migración completada!');
}

function streamToBuffer(stream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

migrateImages();
```

Ejecutar:
```bash
npx ts-node scripts/migrate-images.ts
```

## Actualizar URLs de Imágenes

Si tienes URLs de Azure almacenadas en la base de datos, necesitas actualizarlas:

```typescript
// Script de migración de URLs
import { MongoClient } from 'mongodb';

async function updateImageUrls() {
  const client = await MongoClient.connect(process.env.MONGO_URL);
  const db = client.db();

  const events = db.collection('events');

  await events.updateMany(
    { image: { $regex: 'blob.core.windows.net' } },
    [{
      $set: {
        image: {
          $replaceAll: {
            input: '$image',
            find: 'https://futuratickets.blob.core.windows.net/images/',
            replacement: 'https://storage.googleapis.com/futuratickets-dev-images/'
          }
        }
      }
    }]
  );

  console.log('URLs actualizadas');
  await client.close();
}
```

## Testing

### Test Local

1. Asegúrate de tener el service account key configurado
2. Reinicia el servidor:
```bash
npm run start:dev
```

3. Prueba el endpoint de upload:
```bash
curl -X POST http://localhost:3004/admin/events/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@test-image.jpg"
```

Respuesta esperada:
```json
{
  "url": "https://storage.googleapis.com/futuratickets-dev-images/1234567890-abc123.jpg",
  "filename": "1234567890-abc123.jpg"
}
```

### Test de Integración

Crear test en `src/Event/admin-event.controller.spec.ts`:

```typescript
describe('File Upload', () => {
  it('should upload file to GCS', async () => {
    const mockFile = {
      buffer: Buffer.from('test'),
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
    };

    const result = await request(app.getHttpServer())
      .post('/admin/events/upload')
      .attach('file', mockFile.buffer, mockFile.originalname)
      .expect(200);

    expect(result.body.url).toContain('storage.googleapis.com');
    expect(result.body.filename).toBeDefined();
  });
});
```

## Producción

### Variables de Entorno para Producción

```bash
GCS_PROJECT_ID=futuratickets-prod
GCS_BUCKET_NAME=futuratickets-prod-images
GCS_KEY_FILE=/etc/secrets/gcs-service-account-key.json
```

### Kubernetes Secrets (si aplica)

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: gcs-credentials
type: Opaque
data:
  key.json: <base64-encoded-service-account-key>
```

Montar en el deployment:
```yaml
volumes:
  - name: gcs-credentials
    secret:
      secretName: gcs-credentials
volumeMounts:
  - name: gcs-credentials
    mountPath: /etc/secrets
    readOnly: true
```

### Cloud Run / App Engine

Para Cloud Run o App Engine, puedes usar Application Default Credentials sin necesidad del archivo JSON:

```typescript
// storage.service.ts
constructor(private configService: ConfigService) {
  const projectId = this.configService.get<string>('GCS_PROJECT_ID');

  // Si no hay keyFilename, usa ADC (Application Default Credentials)
  const keyFilename = this.configService.get<string>('GCS_KEY_FILE');

  this.storage = new Storage(
    keyFilename ? { projectId, keyFilename } : { projectId }
  );

  this.bucketName = this.configService.get<string>('GCS_BUCKET_NAME');
}
```

## Rollback Plan

Si necesitas revertir a Azure Blob Storage:

1. Reinstalar dependencias:
```bash
npm install @nestjs/azure-storage @azure/storage-blob
```

2. Revertir cambios en git:
```bash
git revert <commit-hash-de-migracion>
```

3. Restaurar variables de entorno de Azure:
```bash
AZURE_STORAGE_CONNECTION_STRING=...
AZURE_STORAGE_CONTAINER_NAME=images
```

4. Reiniciar aplicación

## Recursos Adicionales

- [Google Cloud Storage Documentation](https://cloud.google.com/storage/docs)
- [Node.js Client Library](https://googleapis.dev/nodejs/storage/latest/)
- [Service Account Best Practices](https://cloud.google.com/iam/docs/best-practices-service-accounts)
- [Cloud Storage Pricing](https://cloud.google.com/storage/pricing)

## Soporte

Para problemas o dudas sobre la migración, contactar al equipo de desarrollo.
