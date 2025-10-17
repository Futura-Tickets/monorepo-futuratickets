# futura-paginator

## Propósito del Repositorio

**futura-paginator** es un proyecto Next.js 15.2.2 standalone diseñado específicamente para servir como **landing page minimalista de presentación** del ecosistema FuturaTickets. Este repositorio actúa como punto de entrada inicial para usuarios que visitan la plataforma, proporcionando información de alto nivel sobre el sistema de ticketing blockchain.

## Contexto en el Ecosistema FuturaTickets

Este repositorio es parte del ecosistema FuturaTickets, un sistema completo de gestión de eventos y ticketing basado en blockchain que incluye:

- **futura-tickets**: App principal de compra de tickets para usuarios finales (React 18 + Ant Design)
- **futura-tickets-admin**: Panel de administración para organizadores (Next.js 15 + Ant Design)
- **futura-tickets-event**: App de gestión y visualización de eventos (Next.js 15 + Ant Design)
- **futura-market-place-v2**: Marketplace de reventa de tickets (Next.js 15 + Radix UI + shadcn)
- **futura-tickets-rest-api**: Backend principal con APIs REST
- **futura-tickets-admin-api**: API para panel de administración
- **futura-market-place-api**: API del marketplace
- **futura-access-api**: API de control de acceso
- **futura-tickets-smartcontracts**: Contratos inteligentes Ethereum
- **futura-tickets-contracts-v2**: Contratos v2
- **landingpage**: Landing page general del proyecto

**futura-paginator** se diferencia del resto por ser:
1. El punto de entrada más minimalista del ecosistema
2. Una página de presentación sin lógica de negocio compleja
3. Un proyecto Next.js vanilla sin dependencias pesadas (solo React 19, Next.js 15.2.2, Tailwind CSS 4)

## Stack Tecnológico

### Framework y Librerías Core
- **Next.js 15.2.2**: Framework React con App Router
- **React 19.0.0**: Librería UI (versión estable)
- **TypeScript 5**: Tipado estático

### Styling
- **Tailwind CSS 4**: Framework CSS utility-first
- **@tailwindcss/postcss 4**: Procesador PostCSS para Tailwind
- **Fuentes**: Geist Sans y Geist Mono (optimizadas con next/font)

### Características
- **App Router**: Usa el nuevo sistema de rutas de Next.js 15
- **TypeScript estricto**: Configuración con modo strict
- **Dark Mode**: Soporte nativo con `prefers-color-scheme`
- **Optimización de fuentes**: Carga automática con next/font/google

## Estructura del Proyecto

```
futura-paginator/
├── src/
│   └── app/
│       ├── layout.tsx       # Root layout con configuración de fuentes
│       ├── page.tsx         # Página principal (actualmente boilerplate Next.js)
│       └── globals.css      # Estilos globales con variables CSS y Tailwind
├── public/                  # Assets estáticos (imágenes, iconos)
├── package.json            # Dependencias y scripts
├── tsconfig.json           # Configuración TypeScript
├── next.config.ts          # Configuración Next.js
├── postcss.config.mjs      # Configuración PostCSS
├── eslint.config.mjs       # Configuración ESLint
└── .gitignore              # Archivos ignorados por Git
```

## Estado Actual del Código

### Implementación
El proyecto actualmente contiene:
- ✅ Configuración completa de Next.js 15 + TypeScript
- ✅ Sistema de fuentes optimizado (Geist Sans/Mono)
- ✅ Dark mode funcional
- ⚠️ **Página principal con contenido boilerplate de Next.js** (pendiente de personalización)

### src/app/page.tsx
Actualmente muestra el template por defecto de Next.js con:
- Logo de Next.js
- Enlaces a documentación
- Botones de deploy en Vercel

**NOTA IMPORTANTE**: Este contenido debe ser reemplazado con información específica de FuturaTickets para cumplir su propósito como landing page del ecosistema.

## Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Modo desarrollo (puerto 3000 por defecto)
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm start

# Linting
npm run lint
```

## Configuración de Puertos

Por defecto, el proyecto se ejecuta en el puerto **3000**. Para cambiar el puerto y evitar conflictos con otros servicios del ecosistema:

```bash
npm run dev -- -p 3005  # Ejemplo: puerto 3005
```

**Referencia de puertos del ecosistema:**
- 3000: futura-paginator (este proyecto)
- 3001: futura-tickets-admin
- 3002: futura-tickets-event
- 3003: futura-market-place-v2

## Guía de Desarrollo

### Personalización de la Landing Page

1. **Modificar src/app/page.tsx**:
   - Eliminar contenido boilerplate de Next.js
   - Agregar secciones específicas de FuturaTickets:
     - Hero section con propuesta de valor
     - Características principales del sistema
     - Call-to-actions hacia otras apps del ecosistema
     - Enlaces a futura-tickets, futura-market-place-v2, etc.

2. **Agregar assets en public/**:
   - Logos de FuturaTickets
   - Imágenes de eventos
   - Iconos personalizados

3. **Personalizar globals.css**:
   - Variables CSS con colores de marca
   - Estilos globales consistentes con el diseño

### Sistema de Fuentes

```typescript
// src/app/layout.tsx
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
```

Las fuentes están disponibles como:
- `font-[family-name:var(--font-geist-sans)]` para Geist Sans
- `font-[family-name:var(--font-geist-mono)]` para Geist Mono

### Dark Mode

El dark mode se activa automáticamente según las preferencias del sistema:

```css
/* globals.css */
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

Para usar las variables en Tailwind:
- `bg-background` → usa var(--background)
- `text-foreground` → usa var(--foreground)

## Consideraciones de Diseño

### Minimalismo
Este proyecto debe mantenerse **ligero y rápido**:
- ❌ NO agregar dependencias pesadas (evitar Ant Design, Material-UI, etc.)
- ✅ Usar Tailwind CSS para estilos
- ✅ Componentes React simples y funcionales
- ✅ Optimización de imágenes con next/image

### Responsive Design
Tailwind CSS facilita el diseño responsive:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Mobile: 1 columna, Tablet: 2 columnas, Desktop: 3 columnas */}
</div>
```

### Performance
- Usar `next/image` para todas las imágenes
- Implementar lazy loading para contenido below-the-fold
- Mantener bundle size < 100KB

## Integración con Otros Repositorios

### Enlaces a Otras Apps
La landing page debe incluir navegación clara hacia:

```tsx
// Ejemplo de enlaces
<Link href="https://app.futuratickets.com">Comprar Tickets</Link>
<Link href="https://admin.futuratickets.com">Panel Admin</Link>
<Link href="https://marketplace.futuratickets.com">Marketplace</Link>
```

### Consistencia de Marca
Mantener consistencia visual con:
- **futura-market-place-v2**: Usa Radix UI + shadcn (similar estética moderna)
- **futura-tickets-admin**: Usa Ant Design (más corporativo)
- **futura-tickets-event**: Usa Ant Design + Google Maps

## Deployment

### Vercel (Recomendado)
```bash
vercel deploy
```

### Build Standalone
```bash
npm run build
# Genera carpeta .next con build optimizado
```

## Troubleshooting

### Error: Puerto en uso
```bash
# Cambiar puerto
npm run dev -- -p 3005
```

### Error: Fuentes no cargan
- Verificar conexión a internet (next/font descarga de Google Fonts)
- Revisar configuración en layout.tsx

### Build falla
```bash
# Limpiar cache
rm -rf .next node_modules
npm install
npm run build
```

## Mejoras Futuras

1. **Contenido Personalizado**
   - [ ] Diseñar hero section de FuturaTickets
   - [ ] Agregar sección "Cómo funciona"
   - [ ] Implementar testimonios/casos de uso
   - [ ] Footer con links a redes sociales

2. **SEO**
   - [ ] Configurar metadata en layout.tsx
   - [ ] Agregar Open Graph tags
   - [ ] Implementar sitemap.xml
   - [ ] Agregar Google Analytics

3. **Animaciones**
   - [ ] Agregar transiciones suaves con Tailwind
   - [ ] Implementar scroll animations
   - [ ] Efectos hover en CTAs

4. **Analytics**
   - [ ] Integrar con Google Analytics
   - [ ] Tracking de conversiones
   - [ ] Heatmaps (Hotjar/Microsoft Clarity)

## Convenciones de Código

### TypeScript
- Usar tipos explícitos para props
- Evitar `any`, preferir `unknown` si es necesario
- Aprovechar type inference cuando sea claro

### Componentes React
```tsx
// Preferir function components con TypeScript
export default function ComponentName() {
  return <div>Content</div>;
}

// Props tipadas
interface ButtonProps {
  label: string;
  onClick: () => void;
}

function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}
```

### Styling
```tsx
// Usar Tailwind classes
<div className="flex items-center justify-center min-h-screen bg-background">
  <h1 className="text-4xl font-bold text-foreground">FuturaTickets</h1>
</div>
```

### Archivos
- Componentes: PascalCase (Button.tsx)
- Utilidades: camelCase (formatDate.ts)
- Páginas: lowercase (page.tsx, layout.tsx)

## Git Workflow

```bash
# Crear branch de feature
git checkout -b feature/custom-hero-section

# Commits descriptivos
git commit -m "feat: add custom hero section with CTA buttons"

# Push y PR
git push origin feature/custom-hero-section
```

### Convención de Commits
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `style:` Cambios de estilo/diseño
- `refactor:` Refactorización de código
- `docs:` Cambios en documentación

## Recursos Adicionales

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [React 19 Release Notes](https://react.dev/blog/2024/04/25/react-19)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Contacto y Soporte

Para consultas sobre este repositorio específico:
- Revisar documentación de Next.js para dudas del framework
- Consultar convenciones del proyecto principal FuturaTickets
- Mantener consistencia con el resto del ecosistema

---

**Versión**: 0.1.0
**Última actualización**: Octubre 2025
**Mantenido por**: Equipo FuturaTickets
