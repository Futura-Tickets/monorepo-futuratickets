# Observabilidad - Plan Inicial (2025 Q1)

## 1. Objetivos

1. **Visibilidad**: exponer métricas mínimas (tráfico, latencia) para APIs críticas.
2. **Alertabilidad**: habilitar puntos de integración con Prometheus/Grafana o herramientas equivalentes.
3. **Uniformidad**: aplicar un patrón común para todos los servicios NestJS y Next.js.

## 2. Implementación inmediata

### 2.1 APIs NestJS (`admin-api`, `market-place-api`)

- Nuevo módulo `MonitoringModule` con:
  - Interceptor global para medir cada petición (método, ruta, status, duración ms).
  - Endpoint `GET /metrics` que expone métricas en formato Prometheus estándar.
- Métricas entregadas por endpoint/HTTP status:
  - `http_requests_total{method,route,status}`
  - `http_request_duration_milliseconds_sum{...}`
  - `http_request_duration_milliseconds_avg{...}`
- Excluimos `/metrics` para evitar bucles.
- Compatible con scrapers Prometheus (`scrape_interval` >= 10s recomendado).

### 2.2 Frontends (Next.js / Expo)

- **Roadmap**: instrumentar métricas de UX y errores vía Sentry (ya configurado) y enviar eventos custom a un endpoint `/metrics/client` (pendiente de diseño).

## 3. Integración recomendada

| Componente | Acción | Responsable |
|------------|--------|-------------|
| Prometheus | Añadir scrape jobs para `admin-api` y `market-place-api` (puerto host: 4101/4102) | DevOps |
| Grafana | Crear dashboard base con paneles de latencia, throughput, códigos 5xx | DevOps |
| Alertmanager | Regla: `http_requests_total` con status ≥500 durante 5 min → alerta Slack | SRE |
| Logs | Mantener Winston + JSON estructurado (ya presente) → enviar a Loki/Datadog | DevOps |

## 4. Roadmap Observabilidad (próximos sprints)

1. **APM ligero**: evaluar OpenTelemetry (OTel SDK) para trazar requests críticos (checkout, mint NFT).
2. **Eventos on-chain**: emitir métricas específicas (número de mint/transfer) desde `AdminEventService` una vez estabilizado el flujo blockchain.
3. **Access Apps**: instrumentar Expo con `expo-application` + `expo-analytics` o Insight (pendiente de decisión en migración v2).
4. **Health unified**: combinar `/health` (Terminus) + `/metrics` en dashboards de servicio.

## 5. Operación

- **Retención**: Prometheus → 15 días; Grafana dashboards versionados en Git.
- **Documentación**: cada servicio debe listar rutas observables en su README (agregado en este ciclo).
- **Monitoreo de costos**: registrar tamaño del TSDB tras primera semana para dimensionar almacenamiento.

## 6. Checklist de despliegue

- [ ] Añadir `MonitoringModule` a cualquier nuevo microservicio NestJS.
- [ ] Declarar scraping en `k8s/monitoring` (pendiente) o docker-compose extendido.
- [ ] Probar `/metrics` manualmente (`curl http://localhost:<puerto>/metrics`).
- [ ] Validar que los buckets/valores crecen tras smoke test.

> **Nota:** Hasta tener Prometheus en producción, `/metrics` puede ser consultado manualmente para diagnóstico rápido. Se recomienda protegerlo detrás de red interna o basic auth cuando se exponga públicamente.
