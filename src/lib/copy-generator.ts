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

function factLabelValue(campaign: Campaign, label: string) {
  return approvedFacts(campaign).find((fact) => fact.label === label)?.value;
}

function audienceCue(contentType: string | undefined, subject: string) {
  const value = `${contentType ?? ""} ${subject}`.toLowerCase();

  if (value.includes("sponsor")) return "local businesses and sponsors";
  if (value.includes("vendor")) return "vendors and community partners";
  if (value.includes("auction") || value.includes("donor")) {
    return "silent auction donors and scholarship supporters";
  }
  if (value.includes("volunteer")) return "event volunteers";
  if (value.includes("participant") || value.includes("stick horse")) {
    return "Stick Horse Showdown participants and families";
  }
  if (value.includes("thank") || value.includes("recognition")) {
    return "supporters, sponsors, volunteers, and community members";
  }

  return "local families and community members";
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
  const purposeFact =
    factLabelValue(campaign, "Event purpose") ??
    "bring families and Rotary together around community impact.";
  const coreMessaging =
    factLabelValue(campaign, "Core messaging") ??
    "The event is hosted by Rotary Club of Dripping Springs and supports local impact.";
  const subject = parseResult.subject ?? "this Rotary update";
  const purpose = parseResult.assetPurpose ?? "community awareness";
  const contentType = confirmedContentType || parseResult.contentType;
  const audience = audienceCue(contentType, subject);

  return {
    facebook: [
      `There is a place for ${audience} at ${eventName}.`,
      "",
      `This ${contentType?.toLowerCase() ?? "campaign"} message is for ${audience}, with a focus on ${purpose.toLowerCase()}.`,
      "",
      `The heart of the event is simple: ${purposeFact}`,
      "",
      beneficiary,
      "",
      coreMessaging,
      "",
      "Follow Rotary Club of Dripping Springs for official updates and ways to get involved.",
    ].join("\n"),
    instagram: [
      `Community comes together at ${eventName}.`,
      "",
      `Family-focused, community-powered, and rooted in local impact. This ${contentType?.toLowerCase() ?? "update"} helps connect ${audience} with the purpose behind the rodeo.`,
      "",
      "Funds raised benefit the Dripping Springs High School Scholarship Fund.",
      "",
      "#DrippingSprings #RotaryClub #BackToSchoolRodeo #CommunityImpact",
    ].join("\n"),
  };
}
