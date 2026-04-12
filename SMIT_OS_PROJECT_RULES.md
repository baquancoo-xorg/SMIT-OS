# SMIT OS - Project Mandatory Rules

These rules are mandatory for all contributors (including AI assistants) to ensure consistency, security, and stability of the SMIT OS project.

---

## 1. Network & Ports
- **Frontend (Vite)**: Must run on port **3001**.
- **Backend (Express)**: Must run on port **3002**.
- **Database (PostgreSQL)**: Host port must be **5431** (Container port remains 5432).
- **Host**: Always use `0.0.0.0` for Docker compatibility but access via `localhost` or `127.0.0.1`.

## 2. Docker Conventions
- **Naming**: All container names must follow the `smit_os_` prefix (e.g., `smit_os_db`, `smit_os_frontend`).
- **Isolation**: Ensure no port or volume name conflicts with existing projects (e.g., avoid `p00_` prefix).
- **Persistence**: Database data must be stored in a named volume (e.g., `smit_os_db_data`).

## 3. Technology Stack & Coding Standards
- **Frameworks**: React 19, Vite, Tailwind CSS 4, TypeScript 5.
- **UI Libraries**: 
  - Icons: `lucide-react`
  - Animations: `motion` (framer-motion)
  - Drag & Drop: `@dnd-kit`
- **TypeScript**: 
  - Strict type checking is required.
  - Avoid using `any`. Define proper interfaces in `src/types/`.
- **Components**: 
  - Use Functional Components with Hooks.
  - Component files should be in `src/components/` organized by domain.
- **Styling**: 
  - Use Tailwind CSS 4 utilities.
  - Avoid ad-hoc CSS unless implementing complex custom animations.

## 4. Workflow & Documentation
- **Changes**: Every code change must be followed by a verification step (linting, build check, or manual test).
- **Sync**: Database schema changes must be reflected in `src/types/` and the initialization scripts.
- **Metadata**: Maintain `metadata.json` and project artifacts (`walkthrough.md`, `task.md`) updated at all times.

## 5. Security
- **Credentials**: Never commit actual secrets or `.env` files. Use `.env.example` as a template.
- **Local First**: Prioritize local solutions (Docker/SQLite) over external cloud services for private data.
