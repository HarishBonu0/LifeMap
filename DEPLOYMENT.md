# LifeMap Deployment Guide 🚀

This document covers everything you need to deploy LifeMap to production.

---

## ⚡ Option 1: Deploy with Vercel (Recommended — ~60 seconds)

Vercel is the fastest and most reliable platform for Vite + React applications and has native support for serverless `/api/chat`.

### Step-by-Step Instructions:

1. **Sign in to Vercel**:
   - Go to [vercel.com](https://vercel.com/) and click **Sign Up** or **Log In** using your GitHub account (`himabindu-279` / `HarishBonu0`).

2. **Import Repository**:
   - On the Vercel Dashboard, click **"Add New..."** > **"Project"**.
   - Under *Import Git Repository*, locate and select **`HarishBonu0/LifeMap`**.
   - (If you haven't granted Vercel permissions to your GitHub account or org, click "Install Vercel on GitHub" and grant access to the `LifeMap` repository).

3. **Configure Project**:
   - **Framework Preset**: `Vite` (Vercel detects this automatically via `vercel.json`).
   - **Root Directory**: `./` (leave default).
   - **Build Command**: `npm run build` (automatic).
   - **Output Directory**: `dist` (automatic).

4. **Environment Variables (Optional for Sandbox Mode, Required for Live Supabase)**:
   In the **Environment Variables** collapsible section, you can add:
   | Key | Value Description | Required? |
   |-----|-------------------|-----------|
   | `VITE_SUPABASE_URL` | Your Supabase Project URL (`https://xyz.supabase.co`) | Optional (App includes client sandbox) |
   | `VITE_SUPABASE_ANON_KEY` | Your Supabase anon public API key | Optional (App includes client sandbox) |
   | `LLM_API_KEY` | Gemini or OpenAI API Key for server AI proxy | Optional (App includes actuarial engine) |
   | `LLM_API_ENDPOINT` | External LLM API URL | Optional |

   > **Note**: Even if you leave environment variables blank initially, LifeMap will launch immediately and function in offline/sandbox mode with user authentication, financial calculations, multi-language support (English, Telugu, Hindi), and quizzes!

5. **Deploy**:
   - Click **Deploy**.
   - In ~45-60 seconds, your site will be live with an automatic HTTPS URL like `https://lifemap-theta.vercel.app`!
   - Every time you push to the `main` branch, Vercel will automatically build and deploy new changes.

---

## 🌐 Option 2: Deploy with Netlify

1. Go to [app.netlify.com](https://app.netlify.com/) and sign in with GitHub.
2. Click **"Add new site"** > **"Import an existing project"**.
3. Select **GitHub** and authorize access to `HarishBonu0/LifeMap`.
4. The build settings are auto-configured by [`netlify.toml`](./netlify.toml):
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click **"Deploy LifeMap"**.

---

## 🗄️ Setting Up Production Supabase (Optional)

If you want persistent user accounts across different devices and browsers:

1. **Create Free Supabase Project**:
   - Go to [supabase.com](https://supabase.com/) and click **"New Project"**.
   - Choose a project name (e.g., `lifemap-prod`) and a secure database password.

2. **Execute Database Migrations**:
   - In your Supabase Dashboard, open the **SQL Editor** (left sidebar).
   - Open [supabase/migrations/01_lifemap_schema.sql](./supabase/migrations/01_lifemap_schema.sql), paste it into the SQL Editor, and click **Run**.
   - Open [supabase/migrations/02_user_scoped_tables_and_rls.sql](./supabase/migrations/02_user_scoped_tables_and_rls.sql), paste it into the SQL Editor, and click **Run**.
   - This sets up all profiles, assessments, game progress, chats, and Row Level Security policies.

3. **Copy API Credentials**:
   - In Supabase, go to **Project Settings** > **API**.
   - Copy:
     - **Project URL** (`https://<project-ref>.supabase.co`)
     - **Project API Keys** -> `anon` / `public`
   - Paste these into Vercel/Netlify Environment Variables as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
   - Redeploy or trigger a new build.

---

## 🔄 Automated CI/CD
A GitHub Actions workflow is included at [`.github/workflows/ci.yml`](./.github/workflows/ci.yml).
Every commit or pull request to `main` will automatically trigger unit tests and production build verification.
