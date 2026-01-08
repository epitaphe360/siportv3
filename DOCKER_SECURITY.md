# Docker Security - Secrets Management

## Overview

This document explains the security improvements made to prevent sensitive data exposure in Docker images.

## Problem

Previously, the build used Nixpacks auto-generation, which was automatically including ALL environment variables as `ARG` and `ENV` instructions in the generated Dockerfile. This is a **security vulnerability** because:

1. Secrets in Docker images can be extracted from image layers
2. Images might be pushed to registries where others can access them
3. Build logs often expose ARG values

## Solution

We've switched from Nixpacks to a custom Dockerfile (`deployment/railway.dockerfile`) that:

### ✅ What We Do

1. **Use ARG only for PUBLIC build-time variables** (VITE_* variables)
   - These are client-side API keys that get embedded in JavaScript anyway
   - Examples: `VITE_FIREBASE_API_KEY`, `VITE_SUPABASE_ANON_KEY`
   - These are meant to be public and are required at build time

2. **Never include backend secrets in the Dockerfile**
   - JWT_SECRET
   - STRIPE_SECRET_KEY
   - STRIPE_WEBHOOK_SECRET
   - EXHIBITORS_SECRET
   - METRICS_SECRET
   - These should only exist in backend services, NOT in frontend containers

3. **Use multi-stage builds** to minimize final image size and remove build artifacts

### 🔒 Railway Configuration

#### Build Configuration (railway.json)
```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "deployment/railway.dockerfile"
  }
}
```

#### Environment Variables in Railway

Configure environment variables in Railway dashboard:

**Build-time variables** (passed as `--build-arg`):
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_RECAPTCHA_SITE_KEY`

**Runtime variables** (should NOT be in frontend):
- Do NOT add backend secrets like `JWT_SECRET`, `STRIPE_SECRET_KEY` to the frontend service
- These belong in your backend API service only

## Important Notes

### Why VITE_* Variables Aren't "Secrets"

The Docker linter flags variables with names like `API_KEY` as potential secrets. However, Vite's `VITE_` prefix indicates these are **intentionally public** client-side variables:

1. They get embedded directly into the JavaScript bundle
2. Anyone can view them in the browser's DevTools
3. They're designed to be exposed (e.g., Firebase client config, Stripe publishable key)
4. They're safe to use in `ARG`/`ENV` because they're not actually secret

### Actual Secrets vs Public Keys

| Variable | Type | Location | Secret? |
|----------|------|----------|---------|
| VITE_FIREBASE_API_KEY | Client API Key | Frontend | ❌ No (Public) |
| VITE_SUPABASE_ANON_KEY | Client API Key | Frontend | ❌ No (Public) |
| VITE_STRIPE_PUBLISHABLE_KEY | Client API Key | Frontend | ❌ No (Public) |
| JWT_SECRET | Secret Key | Backend Only | ✅ Yes (Secret) |
| STRIPE_SECRET_KEY | Secret Key | Backend Only | ✅ Yes (Secret) |
| STRIPE_WEBHOOK_SECRET | Secret Key | Backend Only | ✅ Yes (Secret) |

## Testing

To verify secrets aren't in the Docker image:

```bash
# Build the image locally
docker build -t siport-test -f deployment/railway.dockerfile .

# Inspect the image layers - should NOT contain JWT_SECRET, STRIPE_SECRET_KEY, etc.
docker history siport-test

# Check environment variables in the image
docker inspect siport-test | grep -i "env"
```

## References

- [Docker Best Practices: Secrets](https://docs.docker.com/develop/dev-best-practices/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Railway Dockerfile Builds](https://docs.railway.app/deploy/dockerfiles)
