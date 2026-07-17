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

function getCampaign(segment: string | undefined) {
  const normalizedCampaign = segment ? normalizeToken(segment) : "";

  return (
    campaignAliases.get(normalizedCampaign) ??
    campaigns.find((item) => normalizeToken(item.name) === normalizedCampaign)
      ?.name
  );
}

function getContentType(segment: string | undefined) {
  return segment ? contentTypeAliases.get(normalizeToken(segment)) : undefined;
}

function parseFlexibleFilename(
  segments: string[],
  selectedCampaignName: string,
): FilenameParseResult {
  const warnings = [
    "Filename does not use the full naming pattern, so the agent will make a best-effort draft using the selected campaign and available filename details.",
  ];
  const versionCandidate = segments.at(-1);
  const version = /^v\d+$/i.test(versionCandidate ?? "")
    ? versionCandidate
    : undefined;
  const workingSegments = version ? segments.slice(0, -1) : segments;
  const explicitCampaign = getCampaign(workingSegments[0]);
  const contentTypeIndex = workingSegments.findIndex((segment) =>
    Boolean(getContentType(segment)),
  );
  const contentType =
    contentTypeIndex >= 0 ? getContentType(workingSegments[contentTypeIndex]) : undefined;
  const descriptiveSegments = workingSegments.filter(
    (_, index) => index !== contentTypeIndex && !(explicitCampaign && index === 0),
  );
  const subject = descriptiveSegments[0];
  const purposeSegments = descriptiveSegments.slice(1);

  if (!subject) {
    warnings.push("Add a few descriptive words to the filename for stronger copy.");
  }

  return {
    status: subject ? "partial" : "invalid",
    campaign: explicitCampaign ?? selectedCampaignName,
    contentType,
    subject: subject ? humanizeSegment(subject) : undefined,
    assetPurpose:
      purposeSegments.length > 0
        ? humanizeSegment(purposeSegments.join(" "))
        : undefined,
    version,
    warnings,
  };
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

  if (segments.length !== 5) {
    return parseFlexibleFilename(segments, selectedCampaignName);
  }

  const warnings: string[] = [];
  const [campaignSegment, contentTypeSegment, subject, assetPurpose, version] =
    segments;

  const campaign = getCampaign(campaignSegment);

  if (!campaignSegment) {
    warnings.push("Missing campaign segment.");
  } else if (!campaign) {
    warnings.push(`Unknown campaign "${campaignSegment}".`);
  } else if (campaign !== selectedCampaignName) {
    warnings.push(
      `Filename campaign "${campaign}" does not match selected campaign "${selectedCampaignName}".`,
    );
  }

  const contentType = getContentType(contentTypeSegment);

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
