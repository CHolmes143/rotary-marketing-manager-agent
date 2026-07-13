import { approvedFacts, type Campaign } from "@/lib/rotary-data";
import type { FilenameParseResult } from "@/lib/filename-parser";

export type PlatformDrafts = {
  facebook: string;
  instagram: string;
};

function factValue(campaign: Campaign, category: string) {
  return approvedFacts(campaign).find((fact) => fact.category === category)
    ?.value;
}

export function generatePlatformDrafts(
  campaign: Campaign,
  parseResult: FilenameParseResult,
  confirmedContentType: string,
): PlatformDrafts {
  const eventName = factValue(campaign, "event_identity") ?? campaign.name;
  const beneficiary =
    factValue(campaign, "beneficiary") ??
    "Rotary Club of Dripping Springs community service efforts.";
  const subject = parseResult.subject ?? "this Rotary update";
  const purpose = parseResult.assetPurpose ?? "community awareness";
  const contentType = confirmedContentType || parseResult.contentType;

  return {
    facebook: [
      `${eventName} update: ${subject}`,
      "",
      `We are sharing this ${contentType?.toLowerCase() ?? "campaign"} post as part of our ${purpose.toLowerCase()} efforts for the Rotary Club of Dripping Springs.`,
      "",
      beneficiary,
      "",
      "Follow along for official Rotary updates, details, and ways to get involved.",
    ].join("\n"),
    instagram: [
      `${eventName}: ${subject}`,
      "",
      `Community, service, and a little extra Rotary energy for ${purpose.toLowerCase()}.`,
      "",
      "Follow Rotary Club of Dripping Springs for official updates.",
      "",
      "#DrippingSprings #RotaryClub #CommunityService",
    ].join("\n"),
  };
}
