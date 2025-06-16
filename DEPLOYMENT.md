# Deployment Guide: Household Chore Scoring System

This guide will help you deploy your chore tracking app using Supabase for the database and Vercel for hosting.

## 1. Set up Supabase Database

### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create an account
2. Click "New Project"
3. Choose your organization and fill in project details:
   - Name: `household-chores` (or any name you prefer)
   - Database Password: Create a strong password
   - Region: Choose the closest to your location
4. Wait for the project to be created (2-3 minutes)

### Set up Database Schema
1. In your Supabase dashboard, go to the "SQL Editor"
2. Copy and paste the contents of `supabase-schema.sql` (in your project root)
3. Click "Run" to execute the SQL script
4. This will create:
   - `chores` table with initial data
   - `chore_logs` table for tracking activities
   - Proper indexes for performance
   - Row Level Security policies

### Get API Keys
1. Go to "Settings" → "API" in your Supabase dashboard
2. Copy your:
   - **Project URL** (starts with `https://`)
   - **Anon public key** (starts with `eyJ`)

## 2. Configure Environment Variables

### For Local Development
Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

Replace the placeholder values with your actual Supabase URL and anon key.

### Switch to Supabase Data Service
You'll need to update your app to use the Supabase data service instead of localStorage.

**Option 1: Quick Switch (Recommended)**
Update `src/app/page.tsx` to import from the Supabase data service:

```typescript
// Replace this line:
import { 
  initializeData, 
  getAllChores, 
  getTotalScores,
  addChoreLog,
  getWeeklyScores,
  getMonthlyScores
} from "@/lib/data";

// With this:
import { 
  initializeData, 
  getAllChores, 
  getTotalScores,
  addChoreLog,
  getWeeklyScores,
  getMonthlyScores
} from "@/lib/supabase-data";
```

You'll also need to update all the function calls to be async and add proper error handling.

**Option 2: Gradual Migration**
Keep the current localStorage version for local development and create a production build that uses Supabase.

## 3. Deploy to Vercel

### Connect GitHub Repository (Recommended)
1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign up/login
3. Click "New Project"
4. Import your GitHub repository
5. Configure the project:
   - **Framework**: Next.js (should auto-detect)
   - **Root Directory**: `./` (if the Next.js app is in root)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### Add Environment Variables in Vercel
1. In your Vercel project dashboard, go to "Settings" → "Environment Variables"
2. Add the following variables:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Your Supabase project URL
   - **Environment**: All (Production, Preview, Development)
   
   - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: Your Supabase anon key
   - **Environment**: All (Production, Preview, Development)

### Deploy
1. Click "Deploy"
2. Wait for the build to complete (2-3 minutes)
3. Your app will be available at `https://your-project-name.vercel.app`

## 4. Testing Your Deployment

1. Visit your deployed URL
2. Test the following functionality:
   - Adding/editing chores
   - Marking chores as complete
   - Viewing weekly/monthly statistics
   - Data persistence across browser sessions

## 5. Optional: Custom Domain

1. In Vercel dashboard, go to "Settings" → "Domains"
2. Add your custom domain
3. Follow Vercel's instructions to configure DNS

## 6. Database Backup & Security

### Enable Database Backups (Recommended)
1. In Supabase dashboard, go to "Settings" → "Database"
2. Under "Backup Settings", enable automatic backups

### Row Level Security (Already Configured)
The SQL schema includes basic RLS policies. For production use, consider:
- Adding user authentication
- Restricting access to specific users/households
- Implementing more granular permissions

## Troubleshooting

### Common Issues

**Build fails with Supabase errors:**
- Double-check your environment variables are set correctly
- Ensure your Supabase project is active and accessible

**Data not loading:**
- Check browser console for errors
- Verify your Supabase URL and anon key
- Check if RLS policies are too restrictive

**Database connection issues:**
- Ensure your Supabase project region is optimal
- Check if there are any network restrictions

### Getting Help
- Supabase: [docs.supabase.com](https://docs.supabase.com)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Next.js: [nextjs.org/docs](https://nextjs.org/docs)

## Production Considerations

1. **Authentication**: Consider adding user authentication for multi-household support
2. **Data Privacy**: Review and customize RLS policies for your needs
3. **Performance**: Monitor database usage and optimize queries if needed
4. **Monitoring**: Set up error tracking (Sentry, LogRocket, etc.)
5. **Backups**: Regularly backup your Supabase database

Your app is now ready for production use! 🎉 