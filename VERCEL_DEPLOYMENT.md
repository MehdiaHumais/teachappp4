# Vercel Deployment Guide

## Environment Configuration

To deploy this application to Vercel successfully, you need to configure the proper environment variables.

### Option 1: Use Mock API (Recommended for testing)
Set the following environment variable in Vercel:
```
VITE_USE_MOCK_API=true
```

This will use the local storage-based mock API, which works without any external dependencies.

### Option 2: Use Supabase API
If you want to use a real Supabase backend, you need to set these environment variables:

```
VITE_USE_MOCK_API=false
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Setting Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Navigate to your project
3. Go to Settings → Environment Variables
4. Add the variables listed above

## Important Notes

- If `VITE_USE_MOCK_API` is set to `false` but Supabase environment variables are not provided, the app will automatically fall back to mock mode
- The "Unexpected token 'O', 'Offline' is not valid JSON" error occurs when Supabase is configured but the credentials are invalid or the service is unreachable
- For a simple deployment without external dependencies, use `VITE_USE_MOCK_API=true`

## Build Command

The build command should be:
```
npm run build
```

## Root Directory

Make sure to set the root directory to the project root where `package.json` is located.