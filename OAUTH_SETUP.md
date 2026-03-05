# OAuth Integration Setup Guide

This guide explains how to set up Google and Slack OAuth integrations for Chief of Staff.

## Overview

Phase 4 adds OAuth-based integrations for:
- **Google**: Calendar events + Gmail inbox context
- **Slack**: Mention tracking and workspace context

## Prerequisites

1. Running Supabase instance with `oauth_tokens` table
2. Deployed Next.js app (or localhost for testing)
3. Access to Google Cloud Console and Slack API

## Environment Variables

Add these to your `.env.local` file:

```bash
# Supabase (required for OAuth token storage)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Google OAuth2 (Calendar + Gmail)
GOOGLE_OAUTH_CLIENT_ID=your-google-oauth-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-google-oauth-client-secret
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Slack OAuth2
SLACK_CLIENT_ID=your-slack-client-id
SLACK_CLIENT_SECRET=your-slack-client-secret
SLACK_REDIRECT_URI=http://localhost:3000/api/auth/slack/callback

# App URL (change for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Setup Steps

### 1. Get Supabase Service Role Key

1. Go to Supabase Dashboard → Settings → API
2. Copy the `service_role` key (not the `anon` key!)
3. Add to `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`

**Security Note**: This key has admin privileges. NEVER commit it to git or expose it client-side.

### 2. Set up Google OAuth

#### Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable APIs:
   - Google Calendar API
   - Gmail API
4. Go to **APIs & Services** → **Credentials**
5. Click **Create Credentials** → **OAuth 2.0 Client ID**
6. Application type: **Web application**
7. Authorized redirect URIs:
   - For local: `http://localhost:3000/api/auth/google/callback`
   - For production: `https://your-domain.com/api/auth/google/callback`
8. Copy **Client ID** and **Client Secret**

#### Add to Environment

```bash
GOOGLE_OAUTH_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-abc123xyz789
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

#### Configure OAuth Consent Screen

1. Go to **OAuth consent screen**
2. Choose **Internal** (for single user) or **External**
3. Add app info:
   - App name: "Chief of Staff"
   - User support email: your email
4. Add scopes:
   - `https://www.googleapis.com/auth/calendar.readonly`
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
5. Add test users (if external): your email

### 3. Set up Slack OAuth

#### Create Slack App

1. Go to [Slack API](https://api.slack.com/apps)
2. Click **Create New App** → **From scratch**
3. App name: "Chief of Staff"
4. Select your workspace

#### Configure OAuth & Permissions

1. Go to **OAuth & Permissions**
2. Add **Redirect URLs**:
   - For local: `http://localhost:3000/api/auth/slack/callback`
   - For production: `https://your-domain.com/api/auth/slack/callback`
3. Add **Bot Token Scopes**:
   - `search:read`
   - `channels:history`
   - `groups:history`
   - `im:history`
   - `mpim:history`
   - `users:read`
   - `team:read`
4. Copy **Client ID** and **Client Secret** from **Basic Information** page

#### Add to Environment

```bash
SLACK_CLIENT_ID=123456789012.345678901234
SLACK_CLIENT_SECRET=abc123xyz789def456ghi789
SLACK_REDIRECT_URI=http://localhost:3000/api/auth/slack/callback
```

### 4. Test Integration Flow

1. Start your dev server: `npm run dev`
2. Navigate to `/settings`
3. Click **Connect** on Google integration
   - Should redirect to Google OAuth consent
   - Grant permissions
   - Redirects back to settings with "Connected" badge
4. Click **Connect** on Slack integration
   - Should redirect to Slack OAuth
   - Select workspace and authorize
   - Redirects back to settings

### 5. Verify Context Injection

1. Go to `/chat`
2. Ask: "What's on my calendar today?"
   - Claude should reference your actual calendar events
3. Ask: "Summarize my Slack mentions"
   - Claude should list recent @mentions
4. Ask: "What emails do I need to respond to?"
   - Claude should list unread/important emails

## Troubleshooting

### "Google not connected" error

- Check that OAuth tokens are stored in Supabase `oauth_tokens` table
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Check browser console for API errors

### "Failed to fetch calendar events"

- Ensure Google Calendar API is enabled in GCP
- Check OAuth scopes include `calendar.readonly`
- Verify token hasn't expired (Google tokens expire after 1 hour)

### "Slack authorization failed"

- Check redirect URI matches exactly (trailing slashes matter!)
- Verify Slack app has correct scopes
- Check that app is installed to workspace

### Token refresh not working

- Google: Tokens expire after 1 hour, refresh tokens are long-lived
- Slack: Tokens are long-lived and don't expire
- If refresh fails, disconnect and reconnect integration

## Production Deployment

When deploying to production (Vercel):

1. Add all environment variables to Vercel dashboard
2. Update OAuth redirect URIs to production URL:
   ```
   https://your-domain.vercel.app/api/auth/google/callback
   https://your-domain.vercel.app/api/auth/slack/callback
   ```
3. Update `NEXT_PUBLIC_APP_URL` to production URL
4. Redeploy after updating env vars

## Security Notes

- OAuth tokens are stored encrypted in Supabase
- Service role key must remain server-side only
- Never commit `.env.local` to git
- Use environment-specific redirect URIs
- For multi-user: implement proper user authentication and RLS policies

## Files Changed in Phase 4

```
app/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── google/
│   │   │   │   ├── authorize/route.ts
│   │   │   │   └── callback/route.ts
│   │   │   └── slack/
│   │   │       ├── authorize/route.ts
│   │   │       └── callback/route.ts
│   │   ├── integrations/
│   │   │   ├── status/route.ts
│   │   │   └── [integration]/route.ts
│   │   └── chat/route.ts (updated with Gmail + Slack context)
│   └── settings/page.tsx (new)
├── lib/
│   ├── oauth/
│   │   ├── google.ts
│   │   └── slack.ts
│   ├── gmail.ts (new)
│   ├── slack.ts (new)
│   └── context-builder.ts (updated)
└── supabase/
    └── migrations/
        └── 20260303000003_create_oauth_tokens.sql
```
