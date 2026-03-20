# Withdrawals 2.0 (Questrade)

Vite + React + TypeScript. Includes a **desktop** app (`index.html`) and a **mobile** entry (`mobile.html`, HashRouter).

## Deploy to Vercel (mobile + desktop)

1. Push this repo to GitHub (or GitLab / Bitbucket).
2. In [Vercel](https://vercel.com) → **Add New Project** → import the repo.
3. Use defaults: **Framework Preset** should detect **Vite**, **Build Command** `npm run build`, **Output Directory** `dist`, **Node** 20+ (see `package.json` `engines`).
4. Deploy.

After deploy:

| App    | URL |
|--------|-----|
| **Mobile** | `https://YOUR-PROJECT.vercel.app/mobile` or `…/mobile.html` |
| **Desktop** | `https://YOUR-PROJECT.vercel.app/` (routes like `/withdraw/rrsp` are rewritten to `index.html`) |

From the CLI (after `npm i -g vercel` and login):

```bash
vercel
```

`vercel.json` in the repo sets `outputDirectory`, rewrites for desktop SPA routes, and a short **`/mobile`** path to `mobile.html`.

### Production URL not updating when you push `mobile`

Vercel treats one Git branch as **Production** (often **`main`**). Pushes to any **other** branch (e.g. **`mobile`**) only create **Preview** deployments — they get their **own URL** in the deployment row (e.g. `withdrawals-git-mobile-….vercel.app`). Your main **`*.vercel.app`** link will **not** change until a **production** deploy runs.

**Fix (pick one):**

1. **Use `mobile` as production** (best if you only care about this branch):  
   Vercel → **Project** → **Settings** → **Git** → **Production Branch** → set to **`mobile`** → Save.  
   After that, pushes to `mobile` update **`https://YOUR-PROJECT.vercel.app`** (and `/mobile`).

2. **Keep `main` as production**: merge `mobile` into `main` when you want the main link updated, **or** open each Preview deployment in the dashboard and use the **Preview URL** it shows.

3. **Stale page in the browser**: hard refresh (`Ctrl+Shift+R`) or try incognito. Mobile HTML is sent with short cache headers so new deploys are picked up sooner.

Also confirm **Settings → Git** shows this repo and the correct **root directory** (usually empty / repo root).

If deployments still don’t appear, use **GitHub Actions** with Vercel tokens: see **`docs/VERCEL_DEPLOY.md`**.

---

## React + TypeScript + Vite (template notes)

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
