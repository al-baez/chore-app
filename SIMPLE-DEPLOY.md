# Super Simple Deployment (5 Minutes) 🚀

## Step 1: Create Supabase Project (2 minutes)
1. Go to [supabase.com](https://supabase.com) → Sign up → "New Project"
2. Name it anything, choose a password, pick your region → "Create new project"
3. Wait 2-3 minutes for it to finish setting up

## Step 2: Set up Database (30 seconds)
1. In Supabase: Click "SQL Editor" on the left
2. Copy this entire block and paste it, then click "Run":

```sql
CREATE TABLE chores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  points INTEGER NOT NULL,
  is_negative BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE chore_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chore_id UUID REFERENCES chores(id) ON DELETE CASCADE,
  partner TEXT NOT NULL CHECK (partner IN ('partner1', 'partner2')),
  date DATE NOT NULL,
  points INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

INSERT INTO chores (name, category, points, is_negative) VALUES
  ('Washing dishes', 'Kitchen', 5, false),
  ('Cooking dinner', 'Kitchen', 8, false),
  ('Taking out trash', 'Cleaning', 3, false),
  ('Vacuuming', 'Cleaning', 5, false),
  ('Laundry', 'Cleaning', 6, false),
  ('Grocery shopping', 'Errands', 7, false);

ALTER TABLE chores ENABLE ROW LEVEL SECURITY;
ALTER TABLE chore_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on chores" ON chores FOR ALL USING (true);
CREATE POLICY "Allow all operations on chore_logs" ON chore_logs FOR ALL USING (true);
```

## Step 3: Get Your Keys (30 seconds)
1. In Supabase: Click "Settings" → "API"
2. Copy these two things:
   - **URL** (starts with `https://`)
   - **anon public** key (long string starting with `eyJ`)

## Step 4: Add Keys to Your App (30 seconds)
Create a file called `.env.local` in your project folder and paste this:

```
NEXT_PUBLIC_SUPABASE_URL=paste_your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste_your_key_here
```

## Step 5: Deploy to Vercel (1 minute)
1. Push your code to GitHub (if you haven't already)
2. Go to [vercel.com](https://vercel.com) → Sign up → "New Project"
3. Import your GitHub repo
4. In "Environment Variables" section, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your key
5. Click "Deploy"

## Done! 🎉
Your app will be live at `https://yourproject.vercel.app`

---

**Need help with any step?** Just tell me which step you're stuck on and I'll walk you through it! 