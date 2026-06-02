# offers-debug-panel

Frontend debug panel for diagnosing supplier optin offer visibility and lifecycle routing.

## Stack
React 18 · TypeScript · MUI v5 · Vite 5 · Express 4 (proxy) · Redux Toolkit

## Setup

```bash
npm install
cp .env.example .env
# Edit .env — set SUPPLIER_OPTIN_ADMIN_BASE_URL and OFFER_PLATFORM_BASE_URL
npm run dev
```

Client: http://localhost:3000  
Proxy server: http://localhost:3001

## Three paths

| Path | Entry | Flow |
|------|-------|------|
| A | EID + SID → optins found | Select optin → backtrace → Lifecycle A |
| B | EID + SID → no optins | Enter PID → offers → Lifecycle B |
| C (direct) | PID + SID only | All offers grouped by EID → select → auto-detect lifecycle |

## Contributing

1. Branch from `main`.
2. Open a PR. Both collaborators must review.
3. Never commit `.env` or secrets.
