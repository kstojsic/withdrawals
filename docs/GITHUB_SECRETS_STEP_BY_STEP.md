# Fix: “VERCEL_TOKEN is empty” (and ORG / PROJECT)

The workflow **cannot deploy** until you add **three repository secrets** in GitHub. Names must match **exactly** (case-sensitive).

---

## Part 1 — Get values from Vercel (5 minutes)

### A) `VERCEL_TOKEN`

1. Open **[vercel.com/account/tokens](https://vercel.com/account/tokens)** (log in if needed).
2. Click **Create**, give it a name (e.g. `github-actions`), choose scope if asked, **Create**.
3. **Copy the token once** — you won’t see it again.  
   - It often starts with something like a long random string (not `prj_` or `team_`).

### B) `VERCEL_PROJECT_ID` and `VERCEL_ORG_ID`

1. Open **[vercel.com/dashboard](https://vercel.com/dashboard)** → click your **Withdrawals** (or this) **project**.
2. Go to **Settings** (gear) → **General**.
3. Scroll to **Project ID** — copy the value that starts with **`prj_`**.  
   → This is **`VERCEL_PROJECT_ID`**.
4. On the same **General** page, find **Team ID** or your **personal account** identifier:
   - Team project: copy **`team_…`** → **`VERCEL_ORG_ID`**.
   - Hobby / personal: copy **`user_…`** → **`VERCEL_ORG_ID`**.
5. If you only see a team **name** and not `team_…`, open **Team Settings** → **General** and copy **Team ID**.

**Do not** use the project **name** or **URL slug** as `VERCEL_ORG_ID` — it must be `team_…` or `user_…`.

---

## Part 2 — Add secrets in GitHub (2 minutes)

1. Open your repo on GitHub, e.g. **`https://github.com/kstojsic/withdrawals`**  
   (use **your** fork URL if you deploy from a fork).
2. Click **Settings** (repo settings, not your profile).
3. Left sidebar: **Secrets and variables** → **Actions**.
4. Click **New repository secret** three times and add:

| Name | Secret value |
|------|----------------|
| `VERCEL_TOKEN` | Paste token from Part 1A |
| `VERCEL_ORG_ID` | Paste `team_…` or `user_…` from Part 1B |
| `VERCEL_PROJECT_ID` | Paste `prj_…` from Part 1B |

5. **Save** each one. No quotes around values in the form.

**Important**

- Secret **names** must be exactly: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
- Paste **only** the value — no spaces before/after, no extra blank lines.
- Secrets live on **this repo** (or **fork**). If you use a fork, add them on the **fork**, not only on the upstream repo.

---

## Part 3 — Run the workflow again

1. **Actions** tab → **Deploy to Vercel (mobile flow)**.
2. Open the **failed** run → **Re-run all jobs**,  
   **or** **Run workflow** (if you use manual dispatch).

You should see **“All three secrets are non-empty”** in the logs, then the Vercel deploy step.

---

## Skip GitHub Actions entirely (optional)

If you prefer **not** to use tokens:

1. In Vercel: **Project** → **Settings** → **Git** → connect **`kstojsic/withdrawals`** (or your repo).
2. Ensure the **`mobile`** branch is allowed to deploy.
3. Set **Production Branch** to **`mobile`** if you want the main `.vercel.app` URL to follow this branch.

Then you can ignore the Action secrets and rely on Vercel’s built-in Git deploys (you may want to **disable** or delete the GitHub workflow to avoid confusion).
