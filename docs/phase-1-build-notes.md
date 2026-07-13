# Phase 1 Build Notes

## Current Build

- Owner-only standalone Next.js app.
- Seeded Back to School Rotary Rodeo campaign.
- Placeholder campaign facts are marked as draft or approval-ready in the UI.
- Filename parsing follows `Campaign_ContentType_Subject_AssetPurpose_Version`.
- The upload preview is local browser state for this first vertical slice.
- Facebook and Instagram drafts are generated from approved facts, filename metadata, and confirmed content type.
- Finalized copy creates in-memory learning records that mirror the planned database model.
- The Google Drive document `Rotary Rodeo Brand Voice` is captured as a pending campaign training source from the July 13, 2026 screenshot.

## Next Persistence Step

The UI now calls a server action when finalized copy is saved. When `DATABASE_URL`
is present, the action writes to Prisma/Postgres; without a database, it uses
the seeded in-memory fallback so local development remains usable.

Next infrastructure wiring:

- Vercel Postgres or another dedicated Postgres instance.
- Vercel Blob using `BLOB_READ_WRITE_TOKEN`.
- Server actions or route handlers for uploads, media analysis, copy generation, and finalization.
- Training-source ingestion for Google Drive docs, including storing source URL, extracted text, summary, and campaign scope.

## Isolation Guardrails

This app is built in its own project folder and does not import code, prompts, data, storage, or credentials from CHRE, Custom Walkout Song, or the Rotary Outreach App.
