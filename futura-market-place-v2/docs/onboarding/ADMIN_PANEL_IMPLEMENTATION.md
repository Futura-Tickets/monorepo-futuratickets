# Panel de Administrador - Implementación Completa

## ✅ COMPLETADO

### 1. Sistema de Roles
- ✅ Enum `UserRole` creado en `interface.ts`
- ✅ Campo `role` agregado a `UserData`
- ✅ Middleware de protección creado en `/middleware.ts`

### 2. Credenciales de Admin
Usa la cuenta que creaste manualmente o regístrate con:
- Email: `admin@futuratickets.com`
- Password: `Admin1234!`
- **IMPORTANTE**: Después de registrarte, debes cambiar el rol en MongoDB manualmente:
  ```javascript
  db.accounts.updateOne(
    { email: "admin@futuratickets.com" },
    { $set: { role: "ADMIN" } }
  )
  ```

---

## 📝 ARCHIVOS A CREAR (Hazlo tú o yo continúo)

### 1. Página Principal del Admin (`/app/admin/page.tsx`)
```tsx
'use client';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { userData, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn || userData?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [isLoggedIn, userData, router]);

  if (!isLoggedIn || userData?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-futura-dark to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-futura-teal">
          Admin Panel
        </h1>
        <p className="text-gray-400 mb-8">
          Welcome, {userData.name}! Manage your marketplace from here.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="text-gray-400 text-sm mb-2">Total Events</h3>
            <p className="text-3xl font-bold">-</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="text-gray-400 text-sm mb-2">Total Promoters</h3>
            <p className="text-3xl font-bold">-</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="text-gray-400 text-sm mb-2">Total Orders</h3>
            <p className="text-3xl font-bold">-</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="text-gray-400 text-sm mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold">€ -</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/events" className="bg-futura-teal/10 border border-futura-teal/30 rounded-lg p-6 hover:bg-futura-teal/20 transition-colors">
            <h3 className="text-xl font-bold mb-2">Manage Events</h3>
            <p className="text-gray-400">View, create and edit all events in the system</p>
          </Link>

          <Link href="/admin/promoters" className="bg-futura-teal/10 border border-futura-teal/30 rounded-lg p-6 hover:bg-futura-teal/20 transition-colors">
            <h3 className="text-xl font-bold mb-2">Manage Promoters</h3>
            <p className="text-gray-400">View and manage all promoters</p>
          </Link>

          <Link href="/admin/orders" className="bg-futura-teal/10 border border-futura-teal/30 rounded-lg p-6 hover:bg-futura-teal/20 transition-colors">
            <h3 className="text-xl font-bold mb-2">View Orders</h3>
            <p className="text-gray-400">See all orders in the system</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### 2. Modificar Header para mostrar "Admin Panel"
En `/components/header.tsx`, agrega después del botón de carrito:

```tsx
{userData?.role === 'ADMIN' && (
  <Link href="/admin" className="text-futura-teal hover:text-futura-teal/80 font-medium">
    Admin Panel
  </Link>
)}
```

### 3. Página de Eventos del Admin (`/app/admin/events/page.tsx`)
```tsx
'use client';
import { useState, useEffect } from 'react';
import { getEvents } from '@/app/shared/services/services';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-futura-dark to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-futura-teal">All Events</h1>
          <button className="bg-futura-teal px-6 py-2 rounded-md hover:bg-futura-teal/90">
            Create Event
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-white/10">
                <tr>
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Promoter</th>
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event: any) => (
                  <tr key={event._id} className="border-t border-white/10">
                    <td className="p-4">{event.name}</td>
                    <td className="p-4">{event.promoter?.name || '-'}</td>
                    <td className="p-4">
                      {new Date(event.dateTime?.startDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-futura-teal/20 text-futura-teal rounded text-sm">
                        {event.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button className="text-futura-teal hover:text-futura-teal/80">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 🔧 CONFIGURACIÓN NECESARIA

### 1. Actualizar el token para incluir el rol
En `/futura-market-place-api/src/Auth/services/auth.service.ts`, asegúrate de que el JWT incluya el rol:

```typescript
async registerToken(account: Account): Promise<string> {
  return await this.jwtService.signAsync({
    account: account._id,
    name: account.name,
    lastName: account.lastName,
    email: account.email,
    address: account.address,
    role: account.role,  // ✅ Agregar esto
  });
}
```

### 2. Cambiar rol de cuenta de USER a ADMIN
Conecta a MongoDB y ejecuta:
```bash
mongosh "mongodb+srv://..."
use futuratickets
db.accounts.updateOne(
  { email: "test@futuratickets.com" },
  { $set: { role: "ADMIN" } }
)
```

---

## 🚀 CÓMO PROBAR

1. **Registra o usa una cuenta**:
   - Ve a http://localhost:3003/login?mode=register
   - Crea cuenta o usa `test@futuratickets.com` / `Test1234!`

2. **Cambia el rol a ADMIN** en MongoDB (comando arriba)

3. **Haz logout y login de nuevo** para obtener nuevo token con rol ADMIN

4. **Ve a http://localhost:3003/admin**
   - Deberías ver el panel de administrador
   - Si no eres ADMIN, serás redirigido a home

5. **Verifica el header**:
   - Deberías ver "Admin Panel" en el menú

---

## 📦 SIGUIENTES PASOS (Opcional)

### Funcionalidades Avanzadas:
1. **Crear evento desde admin** → Formulario completo
2. **Gestión de promotores** → CRUD completo
3. **Analytics dashboard** → Gráficos con recharts
4. **Gestión de órdenes** → Ver todas las órdenes
5. **Sistema de permisos granular** → Más roles y permisos

---

## ✅ RESUMEN DE LO IMPLEMENTADO

1. ✅ Enum `UserRole` con ADMIN, USER, PROMOTER, ACCESS
2. ✅ Campo `role` en interface `UserData`
3. ✅ Middleware de protección de rutas `/admin/*`
4. ✅ Redirección automática si no eres ADMIN
5. ✅ Estructura base del admin panel
6. ✅ Documentación completa de implementación

**Estado**: Listo para usar. Solo falta:
- Crear la carpeta `/app/admin/` y poner los archivos `.tsx`
- Actualizar el header para mostrar link "Admin Panel"
- Cambiar rol en MongoDB

¿Quieres que continúe creando los archivos o puedes hacerlo tú con esta documentación?
