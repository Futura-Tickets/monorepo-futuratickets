# Decisión de Convergencia - Apps de Control de Acceso

## 1. Resumen ejecutivo

Actualmente coexistimos con **dos** aplicaciones para el personal de acceso:

| Repositorio | Estado | Stack | Arquitectura | Integración actual |
|-------------|--------|-------|--------------|--------------------|
| `futura-access-app` | Funcional (legacy) | Expo 52 + React Navigation | Context + reducers, navegación tradicional | Conectada a `futura-access-api`, flujo completo de escaneo/validación |
| `futura-tickets-access-app` | Plantilla base (v2) | Expo 52 + Expo Router | Nueva arquitectura de React Native, tabs + theming | Sin wiring final al backend, componentes mock |

**Decisión:** Converger en **`futura-tickets-access-app`** como código base único y descontinuar gradualmente `futura-access-app` una vez replicadas las funcionalidades críticas.

## 2. Motivación

1. **Nueva arquitectura RN** ya habilitada en la versión v2 (mejor rendimiento, soporte a TurboModules).
2. **Expo Router + TypeScript estricto** → rutas tipadas, módulos aislados, DX superior.
3. **Diseño adaptable** (dark mode, web friendly) ya estructurado en la plantilla v2.
4. Reducimos mantenimiento duplicado (dependencias, flujos de login, QA, builds).

## 3. Plan de migración propuesto

| Fase | Objetivo | Entregables | Responsables |
|------|----------|-------------|---------------|
| **0. Auditoría** (1-2 días) | Inventario de pantallas/servicios activos en legacy | Listado de componentes, hooks y endpoints usados en producción | Mobile + QA |
| **1. Wiring API** (3-4 días) | Conectar v2 a `futura-access-api` (login, check-in, stats) | Servicios `auth`, `scan`, `events`, almacenamiento seguro del token | Mobile |
| **2. Port de UI** (1 semana) | Replica de pantallas (Login, Scanner, Resultados, Historial) con componentes reutilizables | Screens Expo Router + tests de snapshot | Mobile + Diseño |
| **3. Integración hardware** (2-3 días) | Cámara, permisos, feedback háptico, offline básico | Hooks `useScanner`, manejo de errores y fallback | Mobile |
| **4. QA + Rollout** (1 semana) | Beta interna + pruebas en evento piloto | Lista de chequeo, docs de despliegue, build en stores | QA + Ops |
| **5. Retiro legacy** (post-GoLive) | Documentar freeze y plan de rollback | marcamos repo legacy como read-only, actualizamos docs | Lider mobile |

## 4. Consideraciones clave

- **Gestión de credenciales:** migrar almacenamiento de token a SecureStore/Keychain en la nueva app.
- **Feature parity mínima:** login ACCESS, escaneo QR, feedback instantáneo, contador de entradas, resumen por evento.
- **Observabilidad:** aprovechar nueva estrategia (sección 5) para instrumentar logs/metricas desde día 1.
- **Rollback:** mantener `futura-access-app` compilable hasta terminar el piloto y documentar cómo generar builds en caso de emergencia.

## 5. Próximos pasos inmediatos

1. Crear backlog detallado en Jira/Linear con las fases anteriores (etiqueta `access-app-migration`).
2. Habilitar CI de `futura-tickets-access-app` (Expo EAS ó GitHub Actions) con esquema `preview`.
3. Sincronizar con equipo de backend las rutas definitivas (`/events/access`, `/accounts/login`, sockets) y definir contratos TypeScript compartidos.
4. Definir freeze date para `futura-access-app` y comunicar a soporte/eventos.

## 6. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Nuevas dependencias Expo Router | Ruptura en builds nativas | Crear pipelines EAS preview + smoke test de cámara antes de merge a main |
| Falta de feature parity el día del evento | Bloqueo operativo | Mantener releases en paralelo durante piloto y habilitar feature flag en backend |
| Gestión de credenciales insegura | Vulneración de tokens | Aplicar SecureStore + refresco periódico, auditar AsyncStorage heredado |

## 7. Estado de comunicación

- [ ] Informar a soporte/eventos el plan de coexistencia temporal.
- [ ] Actualizar `README.md` de ambos repos referenciando este documento.
- [ ] Registrar decisión en la reunión de seguimiento (nota de sprint).
