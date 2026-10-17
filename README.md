# ⚡ DevPulse — Autonomous Dependency & Release Monitor

DevPulse es una plataforma autónoma diseñada para monitorear lanzamientos de dependencias críticas de software (Next.js, Prisma, Tailwind CSS), extrayendo changelogs crudos desde GitHub y procesándolos mediante un LLM para detectar de forma proactiva breaking changes y niveles de urgencia.

## 🚀 Arquitectura y Stack Tecnológico
- **Framework:** Next.js (App Router, Server & Client Components)
- **Estilos:** Tailwind CSS
- **Motor de IA:** Google Gemini 3.8 Flash (`@google/genai` con structured JSON schema)
- **Base de Datos:** PostgreSQL alojado en Supabase
- **ORM:** Prisma v6
- **Integraciones:** GitHub REST API v3

## ⚙️ Características Clave
- **Análisis Semántico con LLM:** Evalúa automáticamente notas de release y categoriza el impacto técnico (`urgency`: low, medium, high; `has_breaking_changes`: boolean).
- **Persistencia Inteligente:** Evita sobrecostos de inferencia verificando si la versión ya fue procesada antes de consultar al modelo.
- **Dashboard Ejecutivo:** Vista en tiempo real del estado de librerías y badges de alerta.

## 🛠️ Configuración Local

1. Clonar el repositorio:
   ```bash
   git clone [https://github.com/TU_USUARIO/devpulse.git](https://github.com/TU_USUARIO/devpulse.git)
   cd devpulse
