# FuturaTickets - Documentation Index

Índice maestro de toda la documentación del proyecto FuturaTickets, organizada siguiendo principios de **Domain-Driven Design (DDD)** y **Arquitectura Hexagonal**.

## 📐 Arquitectura DDD

```
┌─────────────────────────────────────────────────────────┐
│                    INTERFACES                           │
│              (Controllers, APIs, UI)                    │
├─────────────────────────────────────────────────────────┤
│                   APPLICATION                           │
│         (Use Cases, Workflows, Orchestration)          │
├─────────────────────────────────────────────────────────┤
│                     DOMAIN                              │
│        (Business Logic, Entities, Rules)               │
├─────────────────────────────────────────────────────────┤
│                 INFRASTRUCTURE                          │
│    (Database, External APIs, Technical Details)        │
├─────────────────────────────────────────────────────────┤
│                 CROSS-CUTTING                           │
│      (Logging, Security, Monitoring, etc.)             │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura de Documentación

### [01. Domain Layer](./01-domain/) - Conocimiento del Negocio

El corazón del sistema. Contiene la lógica de negocio pura e independiente de infraestructura.

#### [Architecture](./01-domain/architecture/)
- [Architecture Overview](./01-domain/architecture/ARCHITECTURE_OVERVIEW.md)
- [Complete System Architecture](./01-domain/architecture/ARQUITECTURA_SISTEMA_COMPLETO.md)
- [API Architecture](./01-domain/architecture/API_ARCHITECTURE.md)
- [Repository Classification](./01-domain/architecture/REPOSITORIOS_CLASIFICACION.md)

#### [Bounded Contexts](./01-domain/bounded-contexts/)
Los 4 contextos delimitados del sistema:

- **Ticketing**: Venta y emisión de tickets NFT
- **Access Control**: Control de acceso y validación
- **Marketplace**: Mercado secundario de reventa
- **Admin**: Administración y gestión

---

### [02. Application Layer](./02-application/) - Casos de Uso

Orquestación de la lógica de negocio y coordinación entre capas.

#### [Deployment](./02-application/deployment/)
- [Local Deployment Guide](./02-application/deployment/LOCAL_DEPLOYMENT_GUIDE.md)
- [Complete Deployment Guide](./02-application/deployment/GUIA_DESPLIEGUE_COMPLETA.md)
- [Cloud Build Deployment](./02-application/deployment/CLOUDBUILD_DEPLOYMENT.md)
- [Production Environment Setup](./02-application/deployment/PRODUCTION_ENV_SETUP.md)
- [Deployment Status](./02-application/deployment/DEPLOYMENT_STATUS.md)
- [Services Final Status](./02-application/deployment/ESTADO_FINAL_SERVICIOS.md)
- [Successful Deployment](./02-application/deployment/DESPLIEGUE_EXITOSO_COMPLETO.md)
- [Final Deployment Steps](./02-application/deployment/PASOS_FINALES_DEPLOYMENT.md)
- [Deployment Summary](./02-application/deployment/RESUMEN_FINAL_DESPLIEGUE.md)

#### [Workflows](./02-application/workflows/)
- [Sprint Plan](./02-application/workflows/PLAN_DE_SPRINTS.md)
- [Next Steps Roadmap](./02-application/workflows/NEXT_STEPS_ROADMAP.md)
- [Priority Tasks](./02-application/workflows/TAREAS_PRIORITARIAS.md)
- [Dashboard Development Tasks](./02-application/workflows/TAREAS_DESARROLLO_DASHBOARD.md)
- [Blockchain Flow](./02-application/workflows/BLOCKCHAIN_FLOW.md)

#### [Testing](./02-application/testing/)
- [Docker Testing Guide](./02-application/testing/DOCKER_TESTING_GUIDE.md)
- [Local Testing Guide](./02-application/testing/LOCAL_TESTING_GUIDE.md)

---

### [03. Infrastructure Layer](./03-infrastructure/) - Infraestructura Técnica

Implementaciones concretas de persistencia, servicios externos y herramientas.

#### [Docker](./03-infrastructure/docker/)
- [Docker Compose README](./03-infrastructure/docker/DOCKER_COMPOSE_README.md)

#### [GitHub CI/CD](./03-infrastructure/github-cicd/)
- [GitHub Setup](./03-infrastructure/github-cicd/GITHUB_SETUP.md)
- [GitHub Actions Secrets Guide](./03-infrastructure/github-cicd/GITHUB_ACTIONS_SECRETS_GUIDE.md)
- [Push Guide](./03-infrastructure/github-cicd/README_PUSH.md)

#### [Environment](./03-infrastructure/environment/)
- [Environment Setup Summary](./03-infrastructure/environment/ENV_SETUP_SUMMARY.md)
- [Development Port Map](./03-infrastructure/environment/DEV_PORT_MAP.md)
- [Complete Services Access](./03-infrastructure/environment/ACCESO_COMPLETO_SERVICIOS.md)
- [Unified Access Credentials](./03-infrastructure/environment/CREDENCIALES_ACCESO_UNIFICADO.md)

#### [Security](./03-infrastructure/security/)
- [Security Policy](./03-infrastructure/security/SECURITY.md)
- [Security Fixes Guide](./03-infrastructure/security/SECURITY_FIXES_GUIDE.md)

#### [Tooling](./03-infrastructure/tooling/)
- [MCP Configuration](./03-infrastructure/tooling/MCP_CONFIGURATION.md)
- [MCP API Keys Needed](./03-infrastructure/tooling/MCP_API_KEYS_NEEDED.md)
- [Warp Terminal Setup](./03-infrastructure/tooling/WARP.md)

---

### [04. Interfaces Layer](./04-interfaces/) - Puntos de Entrada

Adaptadores de entrada: APIs, UIs, y documentación para desarrolladores.

#### [Getting Started](./04-interfaces/getting-started/)
- [Quick Start](./04-interfaces/getting-started/QUICK_START.md)
- [Environment Quick Start](./04-interfaces/getting-started/ENV_QUICK_START.md)
- [Setup Complete Guide](./04-interfaces/getting-started/SETUP_COMPLETE.md)

#### [Development](./04-interfaces/development/)
- [Contributing Guide](./04-interfaces/development/CONTRIBUTING.md)
- [Step by Step Guide](./04-interfaces/development/PASO_A_PASO.md)
- [Create Repos Manual](./04-interfaces/development/create-repos-manual.md)
- [Workspaces Guide](./04-interfaces/development/WORKSPACES_GUIDE.md)

#### [API Docs](./04-interfaces/api-docs/)
- Documentación de endpoints (pendiente de migrar)

---

### [05. Cross-Cutting Concerns](./05-cross-cutting/) - Aspectos Transversales

Preocupaciones que afectan a todas las capas: logging, monitoring, auditoría.

#### [Troubleshooting](./05-cross-cutting/troubleshooting/)
- [Errors and Solutions](./05-cross-cutting/troubleshooting/ERRORES_Y_SOLUCIONES.md)

#### [Improvements](./05-cross-cutting/improvements/)
- [Improvements Summary](./05-cross-cutting/improvements/IMPROVEMENTS_SUMMARY.md)
- [Completed Improvements](./05-cross-cutting/improvements/IMPROVEMENTS_COMPLETED_SUMMARY.md)
- [Implemented Improvements](./05-cross-cutting/improvements/MEJORAS_IMPLEMENTADAS.md)
- [Completed Work](./05-cross-cutting/improvements/TRABAJO_COMPLETADO.md)

#### [Observability](./05-cross-cutting/observability/)
- [Observability Plan](./05-cross-cutting/observability/OBSERVABILITY_PLAN.md)

#### [Reports](./05-cross-cutting/reports/)
- [Documentation Summary](./05-cross-cutting/reports/DOCUMENTATION_SUMMARY.md)
- [Analysis and Deployment Report](./05-cross-cutting/reports/INFORME_ANALISIS_Y_DESPLIEGUE.md)
- [Executive Final Summary](./05-cross-cutting/reports/RESUMEN_EJECUTIVO_FINAL.md)
- [Complete Final Summary](./05-cross-cutting/reports/RESUMEN_FINAL_COMPLETO.md)
- [Session Summary 2025-10-14](./05-cross-cutting/reports/SESSION_SUMMARY_2025-10-14.md)
- [Current Deployment Status](./05-cross-cutting/reports/ESTADO_ACTUAL_DESPLIEGUE.md)
- [Correction Progress](./05-cross-cutting/reports/PROGRESO_CORRECCION.md)

---

## 🚀 Quick Start por Rol

### Para nuevos desarrolladores
1. [Quick Start](./04-interfaces/getting-started/QUICK_START.md)
2. [Architecture Overview](./01-domain/architecture/ARCHITECTURE_OVERVIEW.md)
3. [Bounded Contexts](./01-domain/bounded-contexts/)
4. [Contributing Guide](./04-interfaces/development/CONTRIBUTING.md)

### Para DevOps
1. [Local Deployment](./02-application/deployment/LOCAL_DEPLOYMENT_GUIDE.md)
2. [Docker Setup](./03-infrastructure/docker/DOCKER_COMPOSE_README.md)
3. [GitHub Actions](./03-infrastructure/github-cicd/GITHUB_ACTIONS_SECRETS_GUIDE.md)
4. [Production Setup](./02-application/deployment/PRODUCTION_ENV_SETUP.md)

### Para Arquitectos
1. [Complete System Architecture](./01-domain/architecture/ARQUITECTURA_SISTEMA_COMPLETO.md)
2. [API Architecture](./01-domain/architecture/API_ARCHITECTURE.md)
3. [Bounded Contexts](./01-domain/bounded-contexts/)
4. [Repository Classification](./01-domain/architecture/REPOSITORIOS_CLASIFICACION.md)

### Para Product Managers
1. [Executive Summary](./05-cross-cutting/reports/RESUMEN_EJECUTIVO_FINAL.md)
2. [Sprint Plan](./02-application/workflows/PLAN_DE_SPRINTS.md)
3. [Roadmap](./02-application/workflows/NEXT_STEPS_ROADMAP.md)
4. [Priority Tasks](./02-application/workflows/TAREAS_PRIORITARIAS.md)

---

## 🏗️ Bounded Contexts

### Ticketing Context
**Servicios**: futura-tickets-admin-api, futura-tickets-contracts-v2
**Responsabilidad**: Venta de tickets NFT y gestión de eventos

### Access Control Context
**Servicios**: futura-access-api, futura-tickets-web-access-app
**Responsabilidad**: Validación de entradas y control de acceso

### Marketplace Context
**Servicios**: futura-market-place-api, futura-market-place-v2
**Responsabilidad**: Mercado secundario de reventa

### Admin Context
**Servicios**: futura-tickets-admin, futura-tickets-admin-api
**Responsabilidad**: Panel de administración

---

## 📚 Principios de esta Documentación

### DDD (Domain-Driven Design)
- **Ubiquitous Language**: Lenguaje común entre negocio y técnico
- **Bounded Contexts**: Límites claros entre contextos
- **Domain Model**: Modelo rico con lógica de negocio

### Arquitectura Hexagonal
- **Domain**: Independiente de infraestructura
- **Application**: Orquestación de casos de uso
- **Infrastructure**: Implementaciones concretas
- **Interfaces**: Adaptadores de entrada
- **Cross-Cutting**: Aspectos transversales

### Clean Architecture
- **Dependency Rule**: Las dependencias apuntan hacia adentro
- **Testability**: Fácil de testear
- **Independence**: Frameworks como detalles

---

## 📝 Notas

- Esta documentación sigue principios DDD y arquitectura hexagonal
- Cada capa tiene responsabilidades claramente definidas
- Los bounded contexts están aislados y se comunican por eventos
- La estructura facilita el mantenimiento y escalabilidad

---

**Última actualización**: 2025-10-15
**Versión**: 2.0 (DDD Architecture)
