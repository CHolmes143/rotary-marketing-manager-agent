import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/db";
import {
  campaigns,
  contentTaxonomy,
  normalizeToken,
  trainingSources,
} from "@/lib/rotary-data";
import { derivePostType } from "@/lib/post-type";

export type LearningRecordView = {
  id: string;
  platform: string;
  postType: string;
  contentType: string;
  subject: string;
  aiDraft: string;
  finalCopy: string;
  editReason: string;
  ctaUsed: string;
  formattingPattern: string;
  voicePattern: string;
  finalizedAt: string;
};

export type FinalizeCopyInput = {
  campaignSlug: string;
  filename: string;
  contentType: string;
  subject: string;
  assetPurpose: string;
  postType: string;
  assetType: "image" | "video";
  mimeType: string;
  fileSize: number;
  creativeAnalysis: {
    detectedText?: string;
    visualSummary?: string;
    detectedSubjects?: string[];
    copyAngles?: string[];
    hookIdeas?: string[];
    confidence?: number;
    framesAnalyzed?: number;
    analysisWarnings?: string[];
  };
  filenameParseStatus: "matched" | "partial" | "invalid";
  filenameParseWarnings: string[];
  facebookSuggestedCopy: string;
  facebookApprovedCopy: string;
  instagramSuggestedCopy: string;
  instagramApprovedCopy: string;
  editReason: string;
};

const fallbackRecords: LearningRecordView[] = [];

function toSlug(value: string) {
  return normalizeToken(value).replace(/([a-z0-9])([A-Z])/g, "$1-$2");
}

function formatDate(date: Date) {
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function meaningfulLines(copy: string) {
  return copy
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("#"));
}

function extractCta(copy: string) {
  const lines = meaningfulLines(copy);

  return lines.at(-1) ?? "";
}

function deriveFormattingPattern(copy: string) {
  const lines = meaningfulLines(copy);
  const paragraphCount = lines.length;
  const averageLineLength =
    paragraphCount > 0
      ? Math.round(
          lines.reduce((total, line) => total + line.length, 0) /
            paragraphCount,
        )
      : 0;

  if (paragraphCount <= 3) {
    return `Concise structure: ${paragraphCount} short paragraphs, average ${averageLineLength} characters.`;
  }

  return `Paragraph structure: ${paragraphCount} scannable lines, average ${averageLineLength} characters.`;
}

function deriveVoicePattern(copy: string, editReason: string) {
  const firstLine = meaningfulLines(copy)[0] ?? "";
  const ownerGuidance = editReason.trim();

  return [ownerGuidance ? `Owner guidance: ${ownerGuidance}` : undefined, firstLine ? `Opening pattern: ${firstLine}` : undefined]
    .filter(Boolean)
    .join(" | ")
    .slice(0, 500);
}

export async function ensureSeedData() {
  const prisma = getPrisma();
  if (!prisma) return;

  for (const campaign of campaigns) {
    const dbCampaign = await prisma.campaign.upsert({
      where: { slug: campaign.slug },
      create: {
        name: campaign.name,
        slug: campaign.slug,
        shortDescription: campaign.shortDescription,
        status: campaign.status,
      },
      update: {
        name: campaign.name,
        shortDescription: campaign.shortDescription,
        status: campaign.status,
      },
    });

    for (const fact of campaign.facts) {
      await prisma.campaignKnowledgeFact.upsert({
        where: {
          campaignId_label: {
            campaignId: dbCampaign.id,
            label: fact.label,
          },
        },
        create: {
          campaignId: dbCampaign.id,
          category: fact.category,
          label: fact.label,
          value: fact.value,
          status: fact.status,
          stability: fact.stability,
        },
        update: {
          category: fact.category,
          value: fact.value,
          status: fact.status,
          stability: fact.stability,
        },
      });
    }

    for (const source of trainingSources.filter(
      (item) => item.campaignSlug === campaign.slug,
    )) {
      await prisma.trainingSource.upsert({
        where: { stableKey: source.id },
        create: {
          stableKey: source.id,
          campaignId: dbCampaign.id,
          title: source.title,
          sourceType: source.sourceType,
          scope: source.scope,
          status: source.status,
          sourceUrl: source.sourceUrl,
          capturedFrom: source.capturedFrom,
          accessNote: source.accessNote,
          extractedText: source.extractedText,
          summary: source.summary,
        },
        update: {
          campaignId: dbCampaign.id,
          title: source.title,
          sourceType: source.sourceType,
          scope: source.scope,
          status: source.status,
          sourceUrl: source.sourceUrl,
          capturedFrom: source.capturedFrom,
          accessNote: source.accessNote,
          extractedText: source.extractedText,
          summary: source.summary,
        },
      });
    }
  }

  for (const group of contentTaxonomy) {
    for (const item of group.items) {
      await prisma.contentType.upsert({
        where: { slug: toSlug(item) },
        create: {
          group: group.group,
          name: item,
          slug: toSlug(item),
        },
        update: {
          group: group.group,
          name: item,
          active: true,
        },
      });
    }
  }
}

export async function getLearningRecords(): Promise<LearningRecordView[]> {
  const prisma = getPrisma();
  if (!prisma) return fallbackRecords;

  try {
    await ensureSeedData();
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2021"
    ) {
      return fallbackRecords;
    }

    throw error;
  }

  const records = await prisma.learningRecord.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { contentType: true },
  });

  return records.map((record) => ({
    id: record.id,
    platform: record.platform === "facebook" ? "Facebook" : "Instagram",
    postType: record.postType ?? "Post",
    contentType: record.contentType?.name ?? "Unconfirmed content type",
    subject: record.subject ?? "Unconfirmed subject",
    aiDraft: record.aiDraft,
    finalCopy: record.finalCopy,
    editReason: record.editReason ?? "",
    ctaUsed: record.ctaUsed ?? "",
    formattingPattern: record.formattingPattern ?? "",
    voicePattern: record.voicePattern ?? "",
    finalizedAt: formatDate(record.createdAt),
  }));
}

export async function saveFinalizedCopy(input: FinalizeCopyInput) {
  const facebookFinalCopy =
    input.facebookApprovedCopy.trim() || input.facebookSuggestedCopy.trim();
  const instagramFinalCopy =
    input.instagramApprovedCopy.trim() || input.instagramSuggestedCopy.trim();

  if (
    !input.facebookSuggestedCopy.trim() ||
    !input.instagramSuggestedCopy.trim() ||
    !facebookFinalCopy ||
    !instagramFinalCopy
  ) {
    return { ok: false, records: await getLearningRecords() };
  }

  const prisma = getPrisma();

  if (!prisma) {
    const timestamp = formatDate(new Date());
    fallbackRecords.unshift(
      {
        id: crypto.randomUUID(),
        platform: "Instagram",
        postType: input.postType,
        contentType: input.contentType,
        subject: input.subject,
        aiDraft: input.instagramSuggestedCopy,
        finalCopy: instagramFinalCopy,
        editReason: input.editReason,
        ctaUsed: extractCta(instagramFinalCopy),
        formattingPattern: deriveFormattingPattern(instagramFinalCopy),
        voicePattern: deriveVoicePattern(instagramFinalCopy, input.editReason),
        finalizedAt: timestamp,
      },
      {
        id: crypto.randomUUID(),
        platform: "Facebook",
        postType: input.postType,
        contentType: input.contentType,
        subject: input.subject,
        aiDraft: input.facebookSuggestedCopy,
        finalCopy: facebookFinalCopy,
        editReason: input.editReason,
        ctaUsed: extractCta(facebookFinalCopy),
        formattingPattern: deriveFormattingPattern(facebookFinalCopy),
        voicePattern: deriveVoicePattern(facebookFinalCopy, input.editReason),
        finalizedAt: timestamp,
      },
    );

    revalidatePath("/");
    return { ok: true, records: fallbackRecords };
  }

  await ensureSeedData();
  const postType = input.postType || derivePostType(input.filename, {
    contentType: input.contentType,
    subject: input.subject,
    assetPurpose: input.assetPurpose,
  });

  const campaign = await prisma.campaign.findUniqueOrThrow({
    where: { slug: input.campaignSlug },
  });
  const contentType = await prisma.contentType.upsert({
    where: { slug: toSlug(input.contentType) },
    create: {
      group: "Unconfirmed",
      name: input.contentType,
      slug: toSlug(input.contentType),
    },
    update: { name: input.contentType },
  });
  const factsSnapshot =
    campaigns
      .find((item) => item.slug === input.campaignSlug)
      ?.facts.map((fact) => ({
        category: fact.category,
        label: fact.label,
        value: fact.value,
        status: fact.status,
        stability: fact.stability,
      })) ?? [];

  const asset = await prisma.creativeAsset.create({
    data: {
      campaignId: campaign.id,
      contentTypeId: contentType.id,
      filenameOriginal: input.filename,
      filenameCampaign: campaign.name,
      filenameContentType: input.contentType,
      filenameSubject: input.subject,
      filenameAssetPurpose: input.assetPurpose,
      filenameVersion: input.filename.match(/_([^_]+)\.[^.]+$/)?.[1],
      postType,
      filenameParseStatus: input.filenameParseStatus,
      filenameParseWarnings: input.filenameParseWarnings,
      assetType: input.assetType,
      storageKey: `pending-blob/${input.filename}`,
      mimeType: input.mimeType || "application/octet-stream",
      fileSize: input.fileSize,
    },
  });

  await prisma.creativeAnalysis.create({
    data: {
      creativeAssetId: asset.id,
      analysisStatus: input.creativeAnalysis.visualSummary
        ? "completed"
        : "skipped",
      detectedText: input.creativeAnalysis.detectedText || null,
      visualSummary: input.creativeAnalysis.visualSummary || null,
      detectedSubjects: {
        subjects: input.creativeAnalysis.detectedSubjects ?? [],
        copyAngles: input.creativeAnalysis.copyAngles ?? [],
        hookIdeas: input.creativeAnalysis.hookIdeas ?? [],
      },
      confidence: input.creativeAnalysis.confidence ?? null,
      framesAnalyzed: input.creativeAnalysis.framesAnalyzed ?? null,
      modelUsed: input.creativeAnalysis.hookIdeas?.length
        ? "openai-vision-plus-browser-media-sampler"
        : "browser-media-sampler",
      analysisWarnings: input.creativeAnalysis.analysisWarnings ?? [],
    },
  });

  const copySet = await prisma.generatedCopySet.create({
    data: {
      campaignId: campaign.id,
      creativeAssetId: asset.id,
      contentTypeId: contentType.id,
      postType,
      generationStatus: "finalized",
      promptVersion: "phase-1-local-draft",
      modelUsed: "local-template",
      campaignFactsSnapshot: factsSnapshot,
      creativeContextSnapshot: {
        filename: input.filename,
        postType,
        subject: input.subject,
        assetPurpose: input.assetPurpose,
        creativeAnalysis: input.creativeAnalysis,
        warnings: input.filenameParseWarnings,
      },
      platformCopies: {
        create: [
          {
            platform: "facebook",
            aiDraft: input.facebookSuggestedCopy,
            currentEditableCopy: facebookFinalCopy,
            finalCopy: facebookFinalCopy,
            editReason: input.editReason || null,
            ctaUsed: extractCta(facebookFinalCopy) || null,
            finalizedAt: new Date(),
          },
          {
            platform: "instagram",
            aiDraft: input.instagramSuggestedCopy,
            currentEditableCopy: instagramFinalCopy,
            finalCopy: instagramFinalCopy,
            editReason: input.editReason || null,
            ctaUsed: extractCta(instagramFinalCopy) || null,
            finalizedAt: new Date(),
          },
        ],
      },
    },
  });

  await prisma.learningRecord.createMany({
    data: [
      {
        campaignId: campaign.id,
        contentTypeId: contentType.id,
        creativeAssetId: asset.id,
        platform: "facebook",
        postType,
        subject: input.subject,
        objective: input.assetPurpose,
        aiDraft: input.facebookSuggestedCopy,
        finalCopy: facebookFinalCopy,
        editReason: input.editReason || null,
        ctaUsed: extractCta(facebookFinalCopy) || null,
        formattingPattern: deriveFormattingPattern(facebookFinalCopy),
        voicePattern: deriveVoicePattern(facebookFinalCopy, input.editReason),
        confidence: input.editReason.trim() ? 0.85 : 0.65,
        patternScope: "campaign",
        rationale: `Post-type learning (${postType}) from GeneratedCopySet ${copySet.id}`,
      },
      {
        campaignId: campaign.id,
        contentTypeId: contentType.id,
        creativeAssetId: asset.id,
        platform: "instagram",
        postType,
        subject: input.subject,
        objective: input.assetPurpose,
        aiDraft: input.instagramSuggestedCopy,
        finalCopy: instagramFinalCopy,
        editReason: input.editReason || null,
        ctaUsed: extractCta(instagramFinalCopy) || null,
        formattingPattern: deriveFormattingPattern(instagramFinalCopy),
        voicePattern: deriveVoicePattern(instagramFinalCopy, input.editReason),
        confidence: input.editReason.trim() ? 0.85 : 0.65,
        patternScope: "campaign",
        rationale: `Post-type learning (${postType}) from GeneratedCopySet ${copySet.id}`,
      },
    ],
  });

  revalidatePath("/");
  return { ok: true, records: await getLearningRecords() };
}
