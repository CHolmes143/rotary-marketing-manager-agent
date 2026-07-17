# Infrastructure Status

Date: July 17, 2026

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

- `dpl_odTFnuZeVpJjCyoGBjQpjTixjqDm`
- Status: `Ready`

## Current Environment State

The Vercel project has dedicated database and media storage environment variables configured for Production, Preview, and Development. The deployed app now writes finalized learning records to the Neon Postgres database instead of staying local-only.

Configured Vercel environment variables:

```text
DATABASE_URL
BLOB_READ_WRITE_TOKEN
ADMIN_BOOTSTRAP_TOKEN
APP_BASE_URL=https://rotary-marketing-manager-agent.vercel.app
NEXT_PUBLIC_APP_NAME=Rotary Marketing Manager
```

Not configured yet:

```text
AI_API_KEY
AI_MODEL_COPY
AI_MODEL_VISION
```

## Database

Dedicated Neon Postgres is provisioned through Vercel Marketplace.

Resource:

- `rotary-marketing-manager-agent-db`

Bootstrap status:

- Schema created through the protected Vercel bootstrap endpoint.
- Seed data loaded: 1 campaign, 41 content types, 1 training source.
- Prisma uses the Postgres driver adapter with `engineType = "client"` to avoid Vercel query-engine binary issues.

## Blob Storage

Dedicated Vercel Blob storage is provisioned and connected to the project.

Resource:

- `rotary-marketing-manager-agent-media`

Remaining application work:

1. Replace local upload preview with route-handler or server-action Blob upload.
2. Store the returned Blob URL and pathname on `CreativeAsset`.
3. Use stored media URLs in generation/media-analysis workflows.

## GitHub

Local git history exists, but no GitHub remote is attached yet.

Current blocker:

- `https://github.com/carissaholmes/rotary-marketing-manager-agent.git` does not exist yet.
- This environment does not have the GitHub CLI installed and the available GitHub connector does not expose repository creation.

Next GitHub step:

1. Create the GitHub repo named `rotary-marketing-manager-agent`.
2. Add it as `origin`.
3. Push `main`.
4. Connect the repo to the Vercel project with `npx vercel git connect`.
