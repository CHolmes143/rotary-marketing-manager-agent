import { getPrisma } from "@/lib/db";
import { ensureSeedData } from "@/lib/workspace-repository";

const statements = [
  `DO $$ BEGIN CREATE TYPE "CampaignStatus" AS ENUM ('draft', 'active', 'archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "FactStatus" AS ENUM ('draft', 'approved', 'expired', 'archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "FactStability" AS ENUM ('permanent', 'annual_review', 'temporary'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "FilenameParseStatus" AS ENUM ('matched', 'partial', 'invalid'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "AssetType" AS ENUM ('image', 'video'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "AnalysisStatus" AS ENUM ('pending', 'completed', 'failed', 'skipped'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "GenerationStatus" AS ENUM ('draft', 'finalized', 'discarded'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "Platform" AS ENUM ('facebook', 'instagram'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "PatternScope" AS ENUM ('platform', 'campaign', 'rotary_wide'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "TrainingSourceType" AS ENUM ('google_drive_doc', 'uploaded_file', 'manual_note'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "TrainingSourceScope" AS ENUM ('campaign', 'rotary_wide'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "TrainingSourceStatus" AS ENUM ('pending_ingestion', 'ingested', 'archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `CREATE TABLE IF NOT EXISTS "Campaign" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Campaign_slug_key" ON "Campaign"("slug")`,
  `CREATE TABLE IF NOT EXISTS "ContentType" (
    "id" TEXT PRIMARY KEY,
    "group" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "ContentType_slug_key" ON "ContentType"("slug")`,
  `CREATE TABLE IF NOT EXISTS "CampaignKnowledgeFact" (
    "id" TEXT PRIMARY KEY,
    "campaignId" TEXT NOT NULL REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "category" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "status" "FactStatus" NOT NULL DEFAULT 'draft',
    "stability" "FactStability" NOT NULL DEFAULT 'annual_review',
    "effectiveStart" TIMESTAMP(3),
    "effectiveEnd" TIMESTAMP(3),
    "sourceNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "CampaignKnowledgeFact_campaignId_label_key" ON "CampaignKnowledgeFact"("campaignId", "label")`,
  `CREATE TABLE IF NOT EXISTS "CreativeAsset" (
    "id" TEXT PRIMARY KEY,
    "campaignId" TEXT NOT NULL REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "contentTypeId" TEXT REFERENCES "ContentType"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "filenameOriginal" TEXT NOT NULL,
    "filenameCampaign" TEXT,
    "filenameContentType" TEXT,
    "filenameSubject" TEXT,
    "filenameAssetPurpose" TEXT,
    "filenameVersion" TEXT,
    "filenameParseStatus" "FilenameParseStatus" NOT NULL,
    "filenameParseWarnings" JSONB NOT NULL,
    "assetType" "AssetType" NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "CreativeAnalysis" (
    "id" TEXT PRIMARY KEY,
    "creativeAssetId" TEXT NOT NULL REFERENCES "CreativeAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "analysisStatus" "AnalysisStatus" NOT NULL DEFAULT 'pending',
    "detectedText" TEXT,
    "visualSummary" TEXT,
    "detectedSubjects" JSONB,
    "confidence" DOUBLE PRECISION,
    "framesAnalyzed" INTEGER,
    "modelUsed" TEXT,
    "analysisWarnings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "CreativeAnalysis_creativeAssetId_key" ON "CreativeAnalysis"("creativeAssetId")`,
  `CREATE TABLE IF NOT EXISTS "GeneratedCopySet" (
    "id" TEXT PRIMARY KEY,
    "campaignId" TEXT NOT NULL REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "creativeAssetId" TEXT NOT NULL REFERENCES "CreativeAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "contentTypeId" TEXT REFERENCES "ContentType"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "generationStatus" "GenerationStatus" NOT NULL DEFAULT 'draft',
    "promptVersion" TEXT NOT NULL,
    "modelUsed" TEXT NOT NULL,
    "campaignFactsSnapshot" JSONB NOT NULL,
    "creativeContextSnapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "PlatformCopy" (
    "id" TEXT PRIMARY KEY,
    "generatedCopySetId" TEXT NOT NULL REFERENCES "GeneratedCopySet"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "platform" "Platform" NOT NULL,
    "aiDraft" TEXT NOT NULL,
    "currentEditableCopy" TEXT NOT NULL,
    "finalCopy" TEXT,
    "editReason" TEXT,
    "ctaUsed" TEXT,
    "finalizedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "LearningRecord" (
    "id" TEXT PRIMARY KEY,
    "campaignId" TEXT NOT NULL REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "contentTypeId" TEXT REFERENCES "ContentType"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "creativeAssetId" TEXT REFERENCES "CreativeAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "platform" "Platform" NOT NULL,
    "subject" TEXT,
    "objective" TEXT,
    "aiDraft" TEXT NOT NULL,
    "finalCopy" TEXT NOT NULL,
    "editReason" TEXT,
    "ctaUsed" TEXT,
    "emojiPattern" TEXT,
    "hashtagPattern" TEXT,
    "formattingPattern" TEXT,
    "voicePattern" TEXT,
    "patternScope" "PatternScope" NOT NULL DEFAULT 'platform',
    "confidence" DOUBLE PRECISION,
    "rationale" TEXT,
    "firstObservedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastObservedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "TrainingSource" (
    "id" TEXT PRIMARY KEY,
    "stableKey" TEXT NOT NULL,
    "campaignId" TEXT REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "title" TEXT NOT NULL,
    "sourceType" "TrainingSourceType" NOT NULL,
    "scope" "TrainingSourceScope" NOT NULL DEFAULT 'campaign',
    "status" "TrainingSourceStatus" NOT NULL DEFAULT 'pending_ingestion',
    "sourceUrl" TEXT,
    "storageKey" TEXT,
    "capturedFrom" TEXT,
    "accessNote" TEXT,
    "extractedText" TEXT,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "TrainingSource_stableKey_key" ON "TrainingSource"("stableKey")`,
];

export async function bootstrapDatabase() {
  const prisma = getPrisma();

  if (!prisma) {
    throw new Error("DATABASE_URL is not configured.");
  }

  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }

  await ensureSeedData();

  const [campaignCount, contentTypeCount, trainingSourceCount, learningCount] =
    await Promise.all([
      prisma.campaign.count(),
      prisma.contentType.count(),
      prisma.trainingSource.count(),
      prisma.learningRecord.count(),
    ]);

  return {
    campaignCount,
    contentTypeCount,
    trainingSourceCount,
    learningCount,
  };
}
