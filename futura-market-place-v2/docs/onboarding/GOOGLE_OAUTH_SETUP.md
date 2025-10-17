# Configuración de Google OAuth - Futura Marketplace

## Error Actual
```
Error 400: redirect_uri_mismatch
Acceso bloqueado: la solicitud de Futura Tickets no es válida
```

## Causa
Las URIs de redirección configuradas en Google Cloud Console no coinciden con la URL desde donde se está ejecutando la aplicación.

---

## Solución: Configurar URIs Autorizadas en Google Cloud Console

### Paso 1: Acceder a Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Inicia sesión con la cuenta que administra el proyecto de FuturaTickets
3. Selecciona el proyecto correcto (debe ser el mismo que tiene el Client ID: `15290406881-f57qpfo1qu9sc9or1osn5dtq74ir25gs`)

### Paso 2: Ir a las Credenciales de OAuth

1. En el menú lateral, ve a **APIs y servicios** → **Credenciales**
2. Busca el Client ID de OAuth 2.0: `15290406881-f57qpfo1qu9sc9or1osn5dtq74ir25gs`
3. Haz clic en el nombre del Client ID para editarlo

### Paso 3: Agregar URIs de Redirección Autorizadas

En la sección **"URIs de redireccionamiento autorizados"**, agrega las siguientes URLs:

#### Para Desarrollo Local:
```
http://localhost:3003
http://localhost:3003/
http://localhost:3003/login
```

#### Para Producción (cuando despliegues):
```
https://marketplace.futuratickets.com
https://marketplace.futuratickets.com/
https://marketplace.futuratickets.com/login
```

#### Nota Importante sobre URLs
- ✅ **Correcto**: `http://localhost:3003` (sin barra final)
- ✅ **Correcto**: `http://localhost:3003/` (con barra final)
- ❌ **Incorrecto**: `http://localhost:3003/login?mode=login` (no incluir query params)

### Paso 4: Agregar Orígenes de JavaScript Autorizados

En la sección **"Orígenes de JavaScript autorizados"**, agrega:

#### Para Desarrollo Local:
```
http://localhost:3003
```

#### Para Producción:
```
https://marketplace.futuratickets.com
```

### Paso 5: Guardar Cambios

1. Haz clic en **"Guardar"**
2. Espera unos segundos a que se propaguen los cambios (puede tardar hasta 5 minutos)

---

## Verificar la Configuración

### Configuración Actual en el Código:

**File**: `.env.local`
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=15290406881-f57qpfo1qu9sc9or1osn5dtq74ir25gs.apps.googleusercontent.com
```

**File**: `app/login/page.tsx` (línea 115-128)
```typescript
const signInGoogle = useGoogleLogin({
  onSuccess: async (codeResponse) => {
    const account = await loginWithGoogle(codeResponse.access_token);
    setUserData(account as any as UserData);
    localStorage.setItem('auth_token', account.token!);
    router.push(`/`);
  },
  flow: 'implicit',
  redirect_uri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3003',
});
```

### Después de Configurar Google Cloud Console:

1. Recarga la página del Marketplace: http://localhost:3003/login
2. Haz clic en "Continue with Google"
3. Debería abrir el popup de Google sin errores

---

## Pantalla de Consentimiento OAuth (Opcional pero Recomendado)

Si también ves errores relacionados con la pantalla de consentimiento:

### Paso 1: Configurar la Pantalla de Consentimiento

1. En Google Cloud Console, ve a **APIs y servicios** → **Pantalla de consentimiento de OAuth**
2. Rellena los campos obligatorios:
   - **Nombre de la aplicación**: Futura Tickets
   - **Correo del usuario de asistencia**: support@futuratickets.com
   - **Logo de la aplicación**: (opcional) Logo de Futura Tickets
   - **Dominios autorizados**: `futuratickets.com`
   - **Correo de contacto del desarrollador**: tu-email@futuratickets.com

### Paso 2: Configurar Ámbitos (Scopes)

Agrega los siguientes scopes necesarios:
- `email` - Ver tu dirección de correo electrónico
- `profile` - Ver tu información personal básica
- `openid` - Autenticación OpenID

### Paso 3: Usuarios de Prueba (si la app está en modo Testing)

Si tu aplicación OAuth está en modo **"Testing"**:
1. Ve a **Usuarios de prueba**
2. Agrega los emails que necesiten probar la aplicación
3. Ejemplo: `alexgarces1998@gmail.com`

**Nota**: Las aplicaciones en modo "Testing" solo permiten hasta 100 usuarios de prueba. Para uso público, necesitas pasar a modo "Production" (requiere verificación de Google).

---

## Troubleshooting

### Error: "This app is blocked"
**Causa**: La aplicación está en modo "Testing" y tu email no está en la lista de usuarios de prueba.
**Solución**: Agrega tu email a los usuarios de prueba o publica la aplicación.

### Error: "Access blocked: Authorization Error"
**Causa**: La aplicación no tiene configurados los scopes correctamente.
**Solución**: Revisa la configuración de la pantalla de consentimiento y asegúrate de tener los scopes básicos (`email`, `profile`, `openid`).

### Error: "redirect_uri_mismatch" (persiste)
**Causa**: Las URLs no coinciden exactamente.
**Solución**:
1. Verifica que no haya espacios en blanco antes/después de las URLs
2. Asegúrate de incluir tanto `http://localhost:3003` como `http://localhost:3003/`
3. Espera 5 minutos después de guardar los cambios
4. Borra la caché del navegador y recarga

---

## Configuración Completa Recomendada

### En Google Cloud Console:

**Orígenes de JavaScript autorizados:**
```
http://localhost:3003
https://marketplace.futuratickets.com
```

**URIs de redireccionamiento autorizados:**
```
http://localhost:3003
http://localhost:3003/
http://localhost:3003/login
https://marketplace.futuratickets.com
https://marketplace.futuratickets.com/
https://marketplace.futuratickets.com/login
```

### Variables de Entorno (.env.local):
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=15290406881-f57qpfo1qu9sc9or1osn5dtq74ir25gs.apps.googleusercontent.com
```

---

## Contacto

Si después de seguir estos pasos el problema persiste:
1. Verifica que estás usando el proyecto correcto de Google Cloud
2. Asegúrate de que el Client ID coincide con el de la aplicación
3. Revisa los logs de Google Cloud Console para más detalles del error

## Referencias

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [React OAuth Google Library](https://www.npmjs.com/package/@react-oauth/google)
- [Authorized Redirect URIs](https://developers.google.com/identity/protocols/oauth2/web-server#uri-validation)
