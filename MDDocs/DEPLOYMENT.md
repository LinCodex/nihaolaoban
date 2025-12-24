# NiHao LaoBan - Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables
Ensure these are set in your deployment platform:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**⚠️ Never expose the service_role key in frontend code!**

### 2. Supabase Configuration

#### Database Tables (Required)
Run these migrations in order in your Supabase SQL Editor:
1. `profiles` - User profiles with roles
2. `listings` - Business listings
3. `listing_images` - Image references
4. `leads` - Contact inquiries
5. `favorites` - User saved listings

#### RLS Policies (Required)
All tables have Row Level Security enabled with appropriate policies.

#### Storage Buckets (Required)
Create in Supabase Dashboard > Storage:
- `listing-images` (public)
- `avatars` (public)

#### Performance Indexes (Recommended)
```sql
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_owner ON public.listings(owner_profile_id);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_status_created ON public.listings(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
```

### 3. Google OAuth (Optional)
Configure in Supabase Dashboard > Authentication > Providers > Google:
- Add your Google OAuth Client ID and Secret
- Set redirect URL to your production domain

---

## Deployment Options

### Option A: Netlify (Recommended)

1. **Connect Repository**
   - Go to [Netlify](https://netlify.com)
   - Click "Add new site" > "Import an existing project"
   - Connect your GitHub/GitLab repo

2. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. **Environment Variables**
   Add in Netlify Dashboard > Site settings > Environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. **Deploy**
   - Click Deploy site
   - Your site will be live at `https://your-site.netlify.app`

### Option B: Vercel

1. **Import Project**
   - Go to [Vercel](https://vercel.com)
   - Click "Add New" > "Project"
   - Import your repository

2. **Framework Preset**: Vite

3. **Environment Variables**
   Add in Vercel Dashboard > Settings > Environment Variables

4. **Deploy**

### Option C: Manual/Static Hosting

1. **Build locally**
   ```bash
   npm run build
   ```

2. **Upload `dist/` folder** to your static hosting provider

---

## Post-Deployment

### 1. Update Supabase Auth Settings
In Supabase Dashboard > Authentication > URL Configuration:
- **Site URL**: `https://your-production-domain.com`
- **Redirect URLs**: Add your production domain

### 2. Update Google OAuth Redirect
If using Google OAuth, update the authorized redirect URI in Google Cloud Console.

### 3. Test All Features
- [ ] Homepage loads correctly
- [ ] Listings display properly
- [ ] User signup/login works
- [ ] Google OAuth works (if configured)
- [ ] Password reset email works
- [ ] Create listing works (when logged in)
- [ ] Admin dashboard accessible (for admin users)

---

## Environment Separation (Recommended)

### Development
- Supabase project: `dev-nihaolaoban`
- `.env.local` with dev credentials

### Production
- Supabase project: `prod-nihaolaoban`
- Environment variables in deployment platform

### Branching Strategy
Use Supabase branching for database changes:
```bash
supabase db branch create feature-xyz
supabase db branch switch feature-xyz
# Make changes, test
supabase db branch merge feature-xyz
```

---

## Monitoring & Maintenance

### Supabase Dashboard
- **Logs**: Monitor API and database logs
- **Usage**: Track database size, API calls, storage
- **Backups**: Automatic daily backups (Pro plan)

### Frontend Monitoring
- ErrorBoundary catches React errors
- Console logs for debugging
- Consider adding Sentry for production error tracking

---

## Build Output

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js (~459 KB gzipped: ~137 KB)
│   ├── ListingsView-[hash].js (~1.7 MB gzipped: ~469 KB)
│   └── [other chunks...]
```

**Note**: ListingsView chunk is large due to map dependencies. Consider:
- Lazy loading map component
- Using dynamic imports for heavy libraries

---

## Support

For issues:
1. Check browser console for errors
2. Check Supabase logs for API errors
3. Verify environment variables are set correctly
4. Ensure RLS policies allow the operation
