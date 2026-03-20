# Deploy to Vercel from the `mobile` branch

If pushes to GitHub don’t create a new deployment, either **connect the repo in Vercel** or use **GitHub Actions** below (works even when the Vercel ↔ Git link is missing or wrong).

## Option A — Vercel Git (simplest)

1. [Vercel](https://vercel.com) → your project → **Settings** → **Git**
2. **Connect** `kstojsic/withdrawals` (or your fork).
3. Enable deployments for the **`mobile`** branch.
4. To update **`https://YOUR-PROJECT.vercel.app`**: set **Production Branch** to **`mobile`** (same screen).

## Option B — GitHub Actions (token deploy)

After you add secrets, **every push to `mobile`** runs a production deploy.

### 1. Create a Vercel token

[Vercel → Account → Tokens](https://vercel.com/account/tokens) → **Create** → copy the value (used as `VERCEL_TOKEN`).

### 2. Get Org ID and Project ID

- **Project ID:** Vercel → Project → **Settings** → **General** → **Project ID** (`prj_…`).
- **Org ID:** same page, **Team ID** if team project, or in [.vercel/project.json](https://vercel.com/docs/projects/overview#project-id) after `npx vercel link` locally — **Team / User ID** (`team_…` or `user_…`).

### 3. Add GitHub repository secrets

Repo **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Name | Value |
|------|--------|
| `VERCEL_TOKEN` | Token from step 1 |
| `VERCEL_ORG_ID` | `team_…` or `user_…` |
| `VERCEL_PROJECT_ID` | `prj_…` |

### 4. Push `mobile` or re-run the workflow

- Push any commit to **`mobile`**, or  
- **Actions** → **Deploy to Vercel (mobile branch)** → **Run workflow**.

### 5. Open the site

- **Mobile app:** `https://YOUR-PROJECT.vercel.app/mobile`

If you use **both** Git integration and this workflow, you may get two deployments per push — you can disconnect Git deploys or disable the workflow.

### Workflow fails in a few seconds

- **“VERCEL_TOKEN is empty”** (or org/project): add all three secrets under **Settings → Secrets and variables → Actions**. Re-run the job after saving.
- **Paste secrets with no extra spaces or line breaks** (especially after copying the token).
- **Org ID** must be **`team_…`** (team) or **`user_…`** (personal), not the project slug.
- **Project ID** is **`prj_…`** from **Project → Settings → General**.

The workflow uses **`vercel deploy --prod`** (build runs on Vercel), not local `vercel build --prebuilt`.
