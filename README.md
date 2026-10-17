# ⚡ DevPulse — Autonomous Dependency & Release Monitor

DevPulse es una plataforma autónoma diseñada para monitorear lanzamientos de dependencias críticas de software (Next.js, Prisma, Tailwind CSS), extrayendo changelogs crudos desde GitHub y procesándolos mediante un LLM para detectar de forma proactiva breaking changes y niveles de urgencia.

---

## 🚀 Arquitectura y Stack Tecnológico

- **Framework:** Next.js (App Router, Server & Client Components)
- **Estilos:** Tailwind CSS
- **Motor de IA:** Google Gemini 3.8 Flash (`@google/genai` con structured JSON schema)
- **Base de Datos:** PostgreSQL alojado en Supabase
- **ORM:** Prisma v6
- **Integraciones:** GitHub REST API v3

---

## ⚙️ Características Clave

- **Análisis Semántico con LLM:** Evalúa automáticamente notas de release y categoriza el impacto técnico (`urgency`: low, medium, high; `has_breaking_changes`: boolean).
- **Persistencia Inteligente:** Evita sobrecostos de inferencia verificando si la versión ya fue procesada en base de datos antes de consultar al modelo.
- **Dashboard Ejecutivo:** Vista en tiempo real del estado de librerías, resúmenes en lenguaje natural y badges de criticidad.

---

## 📡 Endpoints de la API

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/sync` | Retorna el historial de reportes almacenados en Supabase PostgreSQL ordenados por fecha de publicación. |
| `POST` | `/api/sync` | Consulta los últimos releases en GitHub, detecta nuevas versiones, ejecuta el análisis con Gemini y persiste los resultados en la BD. |

---

## 🤖 Salida Estructurada de Gemini (JSON Schema)

El pipeline de ingesta utiliza salida JSON tipada mediante `responseSchema` de Gemini para garantizar respuestas deterministas y validadas:

```json
{
  "repo_name": "vercel/next.js",
  "version": "v15.0.0",
  "has_breaking_changes": true,
  "summary": "Actualización mayor que introduce mejoras de compilación y cambios en Server Actions...",
  "key_changes": [
    "Modificación en el comportamiento por defecto de fetch caching",
    "Optimización de tiempos de inicio en Turbopack"
  ],
  "urgency": "high"
}
```

---

## 🗄️ Modelo de Datos (PostgreSQL vía Prisma)

- **Tabla:** `release_reports`
- **Campos principales:**
  - `id`: CUID (Primary Key)
  - `repo_name`: Nombre del repositorio monitoreado (`String`)
  - `version`: Tag de la versión analizada (`String`)
  - `has_breaking_changes`: Flag booleano de cambios disruptivos (`Boolean`)
  - `summary`: Resumen técnico generado por LLM (`Text`)
  - `key_changes`: Lista de cambios clave (`String[]`)
  - `urgency`: Nivel de prioridad (`low` | `medium` | `high`)
  - `published_at`: Fecha oficial de release (`DateTime`)
  - `html_url`: Enlace directo a las release notes en GitHub (`String`)
- **Restricciones:** Índice único compuesto en `[repo_name, version]` para evitar registros duplicados y optimizar costos de computación.

---

## 🛠️ Configuración Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/TU_USUARIO/devpulse.git
cd devpulse
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto (basado en `.env.example`):

```env
# Google Gemini API
GEMINI_API_KEY="tu_api_key_de_gemini"

# Supabase PostgreSQL (Prisma)
DATABASE_URL="postgresql://postgres.[REF]:[PASS]@[HOST]:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[REF]:[PASS]@[HOST]:5432/postgres"
```

### 4. Sincronizar la base de datos
```bash
npx prisma generate
npx prisma db push
```

### 5. Iniciar el entorno de desarrollo
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación en funcionamiento.
