import { campaigns, contentTypeAliases, normalizeToken } from "@/lib/rotary-data";

export type FilenameParseStatus = "matched" | "partial" | "invalid";

export type FilenameParseResult = {
  status: FilenameParseStatus;
  campaign?: string;
  contentType?: string;
  subject?: string;
  assetPurpose?: string;
  version?: string;
  warnings: string[];
};

const campaignAliases = new Map([
  ["rodeo", "Back to School Rotary Rodeo"],
  ["backtoschoolrotaryrodeo", "Back to School Rotary Rodeo"],
  ["b2srodeo", "Back to School Rotary Rodeo"],
]);

function stripExtension(filename: string) {
  return filename.replace(/\.[^/.]+$/, "");
}

function humanizeSegment(segment: string) {
  return segment
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-]+/g, " ")
    .trim();
}

export function parseCreativeFilename(
  filename: string,
  selectedCampaignName: string,
): FilenameParseResult {
  if (!filename.trim()) {
    return {
      status: "invalid",
      warnings: ["Upload a file before parsing filename metadata."],
    };
  }

  const segments = stripExtension(filename).split("_").filter(Boolean);
  const warnings: string[] = [];

  if (segments.length !== 5) {
    warnings.push(
      `Expected 5 filename segments, found ${segments.length}. Use Campaign_ContentType_Subject_AssetPurpose_Version.`,
    );
  }

  const [campaignSegment, contentTypeSegment, subject, assetPurpose, version] =
    segments;

  const normalizedCampaign = campaignSegment
    ? normalizeToken(campaignSegment)
    : "";
  const campaign =
    campaignAliases.get(normalizedCampaign) ??
    campaigns.find((item) => normalizeToken(item.name) === normalizedCampaign)
      ?.name;

  if (!campaignSegment) {
    warnings.push("Missing campaign segment.");
  } else if (!campaign) {
    warnings.push(`Unknown campaign "${campaignSegment}".`);
  } else if (campaign !== selectedCampaignName) {
    warnings.push(
      `Filename campaign "${campaign}" does not match selected campaign "${selectedCampaignName}".`,
    );
  }

  const contentType = contentTypeSegment
    ? contentTypeAliases.get(normalizeToken(contentTypeSegment))
    : undefined;

  if (!contentTypeSegment) {
    warnings.push("Missing content type segment.");
  } else if (!contentType) {
    warnings.push(`Unknown content type "${contentTypeSegment}".`);
  }

  if (!subject) {
    warnings.push("Missing subject segment.");
  }

  if (!assetPurpose) {
    warnings.push("Missing asset purpose segment.");
  }

  if (!version) {
    warnings.push("Missing version segment.");
  } else if (!/^v\d+$/i.test(version)) {
    warnings.push("Version should use a simple pattern like v1, v2, or v3.");
  }

  const criticalWarnings = warnings.filter((warning) =>
    /unknown|missing campaign|missing content type/i.test(warning),
  );

  return {
    status:
      warnings.length === 0
        ? "matched"
        : criticalWarnings.length > 0
          ? "invalid"
          : "partial",
    campaign,
    contentType,
    subject: subject ? humanizeSegment(subject) : undefined,
    assetPurpose: assetPurpose ? humanizeSegment(assetPurpose) : undefined,
    version,
    warnings,
  };
}
