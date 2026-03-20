# Mobile-Optimized Withdrawals

Mobile viewports **375px–430px**.

## How to access

- **Development**: `npm run dev`, open `http://localhost:5173/mobile.html`
- **Production**: after `npm run build`, open `mobile.html` from `dist/`
- **Vercel**: deploy the repo from the project root. The mobile app is served at **`/mobile`** (rewrites to `mobile.html` in `vercel.json`).
  1. Install deps: `npm install`
  2. Log in: `npx vercel login` (once)
  3. Link & first deploy: `npx vercel` (preview) or `npm run deploy:vercel` (production)
  4. Open: `https://<your-project>.vercel.app/mobile` (Hash routes: `#/`, `#/fhsa`, etc.)

If the Vercel project already exists, run `npx vercel link` in this folder first.

## Structure

- `main.tsx` — entry
- `App.tsx` — `HashRouter` routes: `/`, `/rrsp`, `/fhsa`, `/resp`
- `components/` — mobile UI (includes `WizardShell.tsx`)
- `wizard/` — `types.ts`, `useWizardNavigation.ts`, `standardWizard.tsx`, `rrspWizard.tsx`, `fhsaWizard.tsx`
- `pages/` — `MobileStandardFlow`, `MobileRRSPFlow`, `MobileFHSAFlow`, `MobileRESPFlow`

## Wizard behavior

- **`useWizardNavigation`** — visible steps, id-based remapping when visibility changes (avoids skipping screens).
- **Progress** — Standard uses full-config indices (`progressStepIndex` / `progressTotal`). RRSP/FHSA use **`getRrspWizardShellProgress`** / **`getFhsaWizardShellProgress`** so the header stays a fixed total and doesn’t jump over branch-only steps.
- **RESP** — placeholder route with account switching; full questionnaire can be ported from `src/pages/RESPFlow.tsx`.
