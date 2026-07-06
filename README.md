# pingup-frontend

Frontend сервиса **pingup** (поиск напарника по настольному теннису). Next.js (App Router,
TypeScript, TanStack Query, Zustand, Tailwind v4). API — отдельный репозиторий `pingup-backend`
(FastAPI, `api.pingup.pro`).

## Структура

- `(public)` — SSR/SSG для SEO (лендинг, залы, турниры, публичные профили).
- `(auth)` — вход/регистрация.
- `(app)` — CSR под Bearer (профиль, события, напарники, уведомления, админ-панель).
- `middleware.ts` — грубый guard `(app)` по cookie `has_session` (точные права — на API).
- `lib/api/client.ts` — fetch-обёртка (Bearer + CSRF double-submit, `credentials: include`).

## Локальный запуск

```bash
cp .env.example .env.local         # NEXT_PUBLIC_API_URL=http://localhost:5100
npm install
npm run dev                        # http://localhost:3000
```

## Качество

```bash
npm run lint
npm run typecheck
npm run build
npm audit
```

## Деплой (sprinthost, Node-app)

`next build && next start`, env-переменные и SSL — в панели sprinthost. Апекс `pingup.pro`.
Refresh-cookie на `Domain=.pingup.pro` (общий с `api.pingup.pro`), поэтому CORS на бэкенде
явно разрешает `https://pingup.pro` с credentials.
