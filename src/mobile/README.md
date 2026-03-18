# Mobile-Optimized Withdrawals

This folder contains the mobile-optimized version of the withdrawals app, targeting viewports **375px–430px** wide.

## How to access

- **Development**: Run `npm run dev`, then open `http://localhost:5173/mobile.html`
- **Production**: After `npm run build`, open `mobile.html` from the `dist/` folder (or deploy and visit `/mobile.html`)

## Structure

- `main.tsx` — Mobile entry point
- `App.tsx` — Mobile routing (StandardFlow only)
- `components/` — Mobile-specific components (touch-friendly, 44px+ tap targets)
- `pages/` — MobileStandardFlow

## Notes

- RRSP, FHSA, and RESP withdrawals with special tax forms show a message directing users to the full web experience.
- TFSA, Cash, and Margin withdrawals are fully supported on mobile.
