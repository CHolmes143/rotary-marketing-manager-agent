# Infrastructure Status

Date: July 13, 2026

## Vercel

Project:

- `rotary-marketing-manager-agent`

Project ID:

- `prj_QUfQBuUBNecJ3nAa0M4mfHi0qoE3`

Org ID:

- `team_VJva3979id2HuEYI7GmvfJWf`

Production URL:

- `https://rotary-marketing-manager-agent.vercel.app`

Deployment inspected:

- `dpl_DX9KJtvXQNN3X5cuBL7EWqMuTxe9`
- Status: `Ready`

## Current Environment State

The Vercel project currently has no environment variables configured. The deployed app runs in fallback mode until the dedicated database and blob storage values are added.

Required Vercel environment variables:

```text
DATABASE_URL=
BLOB_READ_WRITE_TOKEN=
AI_API_KEY=
AI_MODEL_COPY=
AI_MODEL_VISION=
APP_BASE_URL=https://rotary-marketing-manager-agent.vercel.app
NEXT_PUBLIC_APP_NAME=Rotary Marketing Manager
```

Optional:

```text
DIRECT_URL=
```

## Database

Prisma/Postgres persistence is implemented in code, but the dedicated Postgres database has not yet been provisioned in Vercel.

After provisioning Postgres:

1. Add `DATABASE_URL` to Vercel environments.
2. Pull env locally if needed with `npx vercel env pull`.
3. Run `npx prisma migrate deploy`.
4. Run `npm run prisma:seed`.
5. Redeploy.

## Blob Storage

Vercel Blob package support is installed and `.env.example` includes `BLOB_READ_WRITE_TOKEN`. The Blob store has not yet been provisioned in Vercel.

After provisioning Blob:

1. Add `BLOB_READ_WRITE_TOKEN` to Vercel environments.
2. Replace local upload preview with route-handler or server-action Blob upload.
3. Store the returned Blob URL and pathname on `CreativeAsset`.

## GitHub

A local git commit exists:

- `5814e63 Build Rotary Marketing Manager phase 1`

No GitHub remote is attached yet because this environment does not have the GitHub CLI installed and the available GitHub connector does not expose repository creation. Create the GitHub repo named `rotary-marketing-manager-agent`, then add it as `origin` and push `main`.
