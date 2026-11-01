# Vercel & Supabase Deployment Guide

Is guide ki madad se aap is blog application ko **Vercel** par host kar sakte hain aur **Supabase PostgreSQL** ko cloud database ke roop mein connect kar sakte hain.

---

## 1. Supabase Cloud Database Setup

1. **Supabase par account banayein**:
   - [supabase.com](https://supabase.com) par jayein aur free account banayein ya login karein.
   - **"New Project"** par click karein.
   - Project ka naam rakhein (e.g. `my-blogger-portal`) aur Database password set karein.
   - Region select karein (e.g. `Singapore` ya `Mumbai` for best speed).

2. **SQL Schema Run Karein**:
   - Supabase dashboard ke left menu mein **"SQL Editor"** par click karein.
   - **"New Query"** par click karein.
   - Is project ke root folder mein maujood `supabase-schema.sql` file ke saare contents ko copy karein aur SQL Editor mein paste karein.
   - **"Run"** button par click karein.
   - Isse aapke database mein 4 tables (`posts`, `author_profile`, `site_settings`, `comments`) aur unke public access policies create ho jayenge.

3. **API Keys Copy Karein**:
   - Supabase dashboard ke left bottom mein **Project Settings (Gear icon)** &rarr; **API** par jayein.
   - Yahan se 2 cheezein copy karein:
     - **Project URL** (e.g. `https://xyzabcdefg.supabase.co`)
     - **Project API Keys &rarr; `anon` `public` key** (e.g. `eyJhbGciOi...`)

---

## 2. GitHub par Code Push Karein

Apne computer ya terminal par ye commands chalayein:

```bash
# 1. Git repository initialize karein (agar nahi hai)
git init

# 2. Saare files stage karein
git add .

# 3. Commit karein
git commit -m "Initial commit for Vercel & Supabase deployment"

# 4. GitHub par ek naya repository create karein (github.com/new)
# Aur apne remote repository se link karein:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git

# 5. Push karein
git push -u origin main
```

---

## 3. Vercel par Deploy Karein

1. **Vercel par Login Karein**:
   - [vercel.com](https://vercel.com) par jayein aur apne GitHub account se sign in karein.

2. **Import Repository**:
   - Vercel dashboard par **"Add New..."** &rarr; **"Project"** par click karein.
   - Apne GitHub repository ko select karke **"Import"** par click karein.

3. **Configure Project**:
   - **Framework Preset**: Vercel automatically **Vite** detect kar lega (project mein `vercel.json` already configured hai).
   - **Root Directory**: `./`

4. **Environment Variables Add Karein**:
   - **Environment Variables** section ko expand karein aur ye do variables add karein:

   | Key | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | Aapka Supabase Project URL (`https://xyz.supabase.co`) |
   | `VITE_SUPABASE_ANON_KEY` | Aapka Supabase `anon` `public` key |

5. **Deploy**:
   - **"Deploy"** button par click karein!
   - 1-2 minute mein aapki website live ho jayegi aur aapko ek free `*.vercel.app` domain mil jayega.

---

## 4. Live Website Features

- Jab aap website par naya post likhenge, profile update karenge, ya koi comment aayega, woh **direct aapke Supabase Cloud Database** mein save hoga.
- Agar kisi vajah se Supabase credentials nahi diye gaye hain, tab bhi website bina kisi crash ke **Local Storage** mode mein kaam karegi.
- Aap live website ke top admin bar mein **"Supabase"** button par click karke connection status dekh sakte hain aur current posts ko Supabase cloud mein migrate bhi kar sakte hain.
