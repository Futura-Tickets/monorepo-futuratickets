# Guía de Testing - Responsive Design

**Fecha**: 16 de Octubre, 2025
**Servicios**: Admin Panel (http://localhost:3003) | Marketplace (http://localhost:3000)

---

## 🎯 Objetivo

Verificar que el diseño responsive funciona correctamente en todas las resoluciones: móvil, tablet y desktop.

---

## 📱 Breakpoints a Probar

### Admin Panel (SCSS)
| Dispositivo | Resolución | Breakpoint | Características |
|-------------|------------|------------|-----------------|
| Mobile Small | 320px-479px | `mobile-sm` | Móviles pequeños (iPhone SE) |
| Mobile | 480px-767px | `mobile` | Móviles estándar |
| Tablet | 768px-1023px | `tablet` | iPads, tablets Android |
| Desktop Small | 1024px-1279px | `desktop-sm` | Laptops |
| Desktop | 1280px-1439px | `desktop` | Monitores estándar |
| Desktop Large | 1440px-1919px | `desktop-lg` | Monitores grandes |
| Desktop XL | 1920px+ | `desktop-xl` | Pantallas 4K |

### Marketplace (Tailwind)
| Dispositivo | Resolución | Breakpoint | Clase Tailwind |
|-------------|------------|------------|----------------|
| Mobile | <640px | - | Base styles |
| Small | 640px+ | `sm:` | Móviles grandes |
| Medium | 768px+ | `md:` | Tablets |
| Large | 1024px+ | `lg:` | Laptops |
| Extra Large | 1280px+ | `xl:` | Desktop |
| 2XL | 1400px+ | `2xl:` | Pantallas grandes |

---

## 🧪 Testing Manual en Chrome DevTools

### Paso 1: Abrir DevTools

1. Abre Chrome
2. Presiona `F12` o `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
3. Click en el icono de **Toggle Device Toolbar** (📱) o presiona `Cmd+Shift+M`

### Paso 2: Probar Admin Panel (http://localhost:3003)

#### A. Mobile (375x667 - iPhone SE)

**✅ Checklist**:
- [ ] **Menu**: Hamburger menu oculto por defecto
- [ ] **Menu**: Click en logo abre menu overlay de 280px
- [ ] **Menu**: Menu se superpone sobre contenido (z-index alto)
- [ ] **Header**: Full width (100%), altura 60px
- [ ] **Dashboard Stats**: 1 columna, cards apiladas verticalmente
- [ ] **Dashboard Stats**: Padding reducido ($spacing-lg = 24px)
- [ ] **Dashboard Stats**: Font-size 22px (no 28px)
- [ ] **Charts**: Stacked verticalmente, full width
- [ ] **Pie Charts**: Auto height, min-height 250px
- [ ] **Events List**: Tabla convertida a cards
- [ ] **Events List**: Cada fila es un card con labels ("NAME:", "STATUS:", etc.)
- [ ] **Inputs**: Width 100%, no min-width
- [ ] **Selects**: Width 100%
- [ ] **Modales**: Padding reducido (16px)
- [ ] **h1**: Font-size 14px (no 16px)

**Comandos para probar**:
```javascript
// En la consola de Chrome:
// Verificar ancho del menu
document.querySelector('.menu-container').offsetWidth  // Debe ser 0 o 280px si activo

// Verificar grid de stats
getComputedStyle(document.querySelector('.dashboard-stats')).gridTemplateColumns
// Debe mostrar: "1fr" (una columna)
```

#### B. Tablet (768x1024 - iPad)

**✅ Checklist**:
- [ ] **Menu**: Sidebar fijo de 80px visible
- [ ] **Menu**: Expande a 300px al hacer click
- [ ] **Header**: Width = calc(100% - 80px), altura 80px
- [ ] **Dashboard Stats**: 2 columnas
- [ ] **Dashboard Stats**: Padding 2.5rem, font-size 28px
- [ ] **Charts**: 2 columnas (tablet-only)
- [ ] **Events List**: Tabla con columnas visible
- [ ] **Inputs**: min-width 160px
- [ ] **h1**: Font-size 16px

**Comandos para probar**:
```javascript
// Verificar grid de stats
getComputedStyle(document.querySelector('.dashboard-stats')).gridTemplateColumns
// Debe mostrar: "1fr 1fr" (dos columnas)

// Verificar ancho del header
document.querySelector('.dashboard-header').offsetWidth
// Debe ser viewport width - 80px
```

#### C. Desktop (1280x720)

**✅ Checklist**:
- [ ] **Menu**: Sidebar de 80px
- [ ] **Menu**: Expande a 300px suavemente
- [ ] **Header**: Width = calc(100% - 80px)
- [ ] **Dashboard Stats**: 5 columnas (original)
- [ ] **Dashboard Stats**: Gap 2.5rem
- [ ] **Pie Charts**: 3 columnas con auto sizing
- [ ] **Charts**: Height fijo 326px
- [ ] **Events List**: Tabla completa
- [ ] **Todo funciona como diseño original**

**Comandos para probar**:
```javascript
// Verificar grid de stats (debe ser 5 columnas)
getComputedStyle(document.querySelector('.dashboard-stats')).gridTemplateColumns
// Debe mostrar: "1fr 1fr 1fr 1fr 1fr"

// Verificar grid de pie charts
getComputedStyle(document.querySelector('.dashboard-pie-container')).gridTemplateColumns
// Debe mostrar: "auto 326px 326px"
```

---

### Paso 3: Probar Marketplace (http://localhost:3000)

#### A. Mobile (375x667)

**✅ Checklist**:
- [ ] **Header**: Search bar oculto, solo visible en Sheet menu
- [ ] **Header**: Logo + Cart + Hamburger menu
- [ ] **Sheet Menu**: Se abre desde la derecha
- [ ] **Sheet Menu**: Contiene search bar
- [ ] **Sheet Menu**: Country selector en grid 2 columnas
- [ ] **Sheet Menu**: Auth buttons full width
- [ ] **Event Grid**: 1 columna
- [ ] **Event Cards**: Full width, stacked
- [ ] **Filters**: Colapsables, full width
- [ ] **Checkout**: Formulario stacked

**Probar**:
```javascript
// Verificar que search está oculto en mobile
getComputedStyle(document.querySelector('form.hidden')).display  // "none"

// Verificar grid de eventos
document.querySelectorAll('.grid').forEach(el => {
    console.log(getComputedStyle(el).gridTemplateColumns)
})
// Debe incluir "1fr" para mobile
```

#### B. Tablet (768x1024)

**✅ Checklist**:
- [ ] **Header**: Search bar visible
- [ ] **Header**: Country selector visible
- [ ] **Header**: Cart + Auth buttons visible
- [ ] **Event Grid**: 2-3 columnas
- [ ] **Filters**: Visible horizontalmente
- [ ] **Spacing**: gap-4 sm:gap-8 aplicado

#### C. Desktop (1280x720)

**✅ Checklist**:
- [ ] **Header**: Todo visible
- [ ] **Event Grid**: 3-4 columnas
- [ ] **Layout completo**

---

## 🖥️ Testing en Dispositivos Reales

### iOS (Safari)

**Dispositivos recomendados**:
- iPhone SE (375x667)
- iPhone 14 (390x844)
- iPad Air (820x1180)

**Cómo acceder**:
1. En tu Mac, encuentra tu IP local: `ifconfig | grep "inet "`
2. En el iPhone/iPad, abre Safari
3. Navega a `http://[TU-IP]:3003` (Admin Panel)
4. Navega a `http://[TU-IP]:3000` (Marketplace)

**⚠️ Problemas comunes en iOS**:
- Viewport height 100vh puede incluir la barra de direcciones
- Touch events diferentes a mouse events
- Hover states no funcionan (usar `:active` en su lugar)

### Android (Chrome)

**Dispositivos recomendados**:
- Pixel 5 (393x851)
- Samsung Galaxy Tab (800x1280)

**Mismo procedimiento que iOS** usando tu IP local.

---

## 🔍 Pruebas Automáticas (Opcional)

### Lighthouse Audit

```bash
# Admin Panel
lighthouse http://localhost:3003 --view --preset=desktop
lighthouse http://localhost:3003 --view --preset=mobile

# Marketplace
lighthouse http://localhost:3000 --view --preset=desktop
lighthouse http://localhost:3000 --view --preset=mobile
```

**Métricas clave**:
- Performance > 90
- Accessibility > 90
- Best Practices > 90

### Playwright Testing (Futuro)

```javascript
// tests/responsive.spec.ts
import { test, expect } from '@playwright/test';

test('Admin Panel mobile menu', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('http://localhost:3003');

  // Menu debe estar oculto
  const menu = page.locator('.menu-container');
  await expect(menu).toHaveCSS('transform', 'matrix(1, 0, 0, 1, -100, 0)');

  // Click en logo abre menu
  await page.locator('.menu-image').click();
  await expect(menu).toHaveClass(/active/);
});
```

---

## 📊 Reporte de Resultados

### Template de Reporte

```markdown
## Prueba: Admin Panel - Mobile (375x667)
**Fecha**: [FECHA]
**Navegador**: Chrome 120
**Device**: iPhone SE emulado

### Resultados:
✅ Menu hamburger funciona
✅ Stats apiladas en 1 columna
⚠️ Modal muy cerca de los bordes (considerar más padding)
❌ Chart overflow horizontal

### Screenshots:
[Adjuntar capturas]

### Notas:
- El overflow del chart se soluciona con overflow-x: auto
```

---

## 🐛 Problemas Conocidos y Soluciones

### 1. Menu no se superpone en mobile
**Problema**: Menu se muestra al lado del contenido en lugar de superponerse.

**Solución**:
```scss
@include mobile-only {
    position: fixed;  // En lugar de absolute
    z-index: $z-index-modal;
}
```

### 2. Charts overflow en mobile
**Problema**: Google Charts no responsive por defecto.

**Solución**:
```scss
.dashboard-chart-container {
    @include mobile-only {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
    }
}
```

### 3. Inputs muy pequeños en mobile
**Problema**: min-width causa que inputs sean pequeños.

**Solución**: Ya implementada con `width: 100%` en mobile.

### 4. Table headers en mobile
**Problema**: Headers de tabla visibles pero no útiles en mobile.

**Solución**: Ya implementada con `display: none` en `.events-list-header`.

---

## ✅ Checklist Final

### Admin Panel
- [ ] Todas las páginas probadas en mobile
- [ ] Todas las páginas probadas en tablet
- [ ] Todas las páginas probadas en desktop
- [ ] Menu funciona correctamente en todos los breakpoints
- [ ] Forms son usables en mobile
- [ ] Tables/Cards funcionan en mobile
- [ ] Modales responsive
- [ ] No hay overflow horizontal en ninguna resolución

### Marketplace
- [ ] Home page responsive
- [ ] Checkout responsive
- [ ] Account page responsive
- [ ] Event modal responsive
- [ ] Cart responsive
- [ ] Footer responsive

### Ambos
- [ ] No hay errores en consola
- [ ] Performance aceptable (LCP < 2.5s)
- [ ] Touch targets >= 44px
- [ ] Texto legible sin zoom (font-size >= 12px)

---

## 📝 Notas Adicionales

### Herramientas Útiles

1. **Chrome DevTools Device Toolbar**: Para emular dispositivos
2. **Responsive Viewer Extension**: Probar múltiples resoluciones simultáneamente
3. **BrowserStack**: Testing en dispositivos reales remotos
4. **LambdaTest**: Similar a BrowserStack

### Keyboard Shortcuts

- `Cmd+Shift+M`: Toggle device toolbar
- `Cmd+Shift+C`: Inspect element
- `Cmd+R`: Reload page
- Rotate device: Click rotate icon in toolbar

### Tips de Testing

1. **Siempre probar en modo incógnito**: Evita cache y extensions
2. **Probar orientación landscape y portrait**: Especialmente en tablets
3. **Probar con network throttling**: Simular 3G/4G
4. **Probar con diferentes densidades de pixel**: Retina vs no-Retina
5. **Probar navegación con teclado**: Tab, Enter, Escape

---

## 🚀 Próximos Pasos

1. **Ejecutar todas las pruebas del checklist**
2. **Documentar problemas encontrados**
3. **Crear issues para problemas críticos**
4. **Implementar tests automatizados con Playwright**
5. **Configurar CI/CD para ejecutar tests responsive**

---

**Creado por**: Claude Code
**Última actualización**: 16 de Octubre, 2025
