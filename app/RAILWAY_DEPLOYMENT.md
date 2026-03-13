# Railway Deployment Guide for Your Own Brain

## Prerequisites
✅ Railway account connected to GitHub
✅ GitHub repository: `nfrazier4/your-own-brain`

## Step 1: Create New Project in Railway

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose: `nfrazier4/your-own-brain`
5. Railway will auto-detect it's a Next.js app

## Step 2: Configure Environment Variables

Add these environment variables in Railway:

### Required Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://osczspddmaipxrznauro.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Anthropic API (Claude AI)
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# Voyage AI (for embeddings - optional)
NEXT_PUBLIC_VOYAGE_API_KEY=your-voyage-api-key-here

# Google OAuth (for Calendar integration)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-railway-domain.railway.app/api/auth/google/callback

# Slack OAuth (for Slack integration)
SLACK_CLIENT_ID=your-slack-client-id
SLACK_CLIENT_SECRET=your-slack-client-secret
SLACK_REDIRECT_URI=https://your-railway-domain.railway.app/api/auth/slack/callback

# Node Environment
NODE_ENV=production
```

### How to Add Variables in Railway:

1. In your Railway project, click on your service
2. Go to the **"Variables"** tab
3. Click **"+ New Variable"**
4. Add each variable with its value
5. Railway will automatically redeploy when you save

## Step 3: Configure Build Settings (Optional)

Railway auto-detects Next.js, but you can customize:

1. **Build Command:** `npm run build` (default)
2. **Start Command:** `npm start` (default)
3. **Root Directory:** Leave as `/app` if repo structure requires it

## Step 4: Domain Configuration

Railway provides a free subdomain:
- Format: `your-own-brain-production.up.railway.app`

Or add a custom domain:
1. Go to **Settings** → **Domains**
2. Click **"Add Domain"**
3. Follow DNS setup instructions

## Step 5: Deploy

1. Railway will automatically deploy on push to `main` branch
2. Watch the deployment logs in Railway dashboard
3. First deploy takes 2-3 minutes

## Step 6: Update OAuth Redirect URIs

After deployment, update your OAuth app redirect URIs:

### Google OAuth Console:
- Go to: https://console.cloud.google.com/apis/credentials
- Update redirect URI to: `https://your-railway-domain.railway.app/api/auth/google/callback`

### Slack OAuth Settings:
- Go to: https://api.slack.com/apps
- Update redirect URI to: `https://your-railway-domain.railway.app/api/auth/slack/callback`

## Troubleshooting

### Build Fails
- Check **Build Logs** in Railway dashboard
- Verify all environment variables are set
- Ensure `package.json` has correct scripts

### App Crashes
- Check **Deploy Logs** in Railway
- Verify `ANTHROPIC_API_KEY` is set
- Check Supabase connection

### Database Errors
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check Supabase project is active
- Verify database tables exist

## Migration from Vercel

Once Railway deployment is confirmed working:
1. Test all features on Railway URL
2. Update DNS to point to Railway (if using custom domain)
3. Can keep Vercel as backup or delete project

## Monitoring

Railway provides:
- **Metrics:** CPU, Memory, Network usage
- **Logs:** Real-time application logs
- **Deployments:** History of all deployments
- **Alerts:** Set up notifications for failures

## Cost Estimate

Railway Free Tier:
- $5 credit/month
- Enough for low-traffic development

Starter Plan ($5/month):
- $5 credit + pay for usage
- Recommended for production

## Support

Railway Docs: https://docs.railway.app/
Railway Discord: https://discord.gg/railway
