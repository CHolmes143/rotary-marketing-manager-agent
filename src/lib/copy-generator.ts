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

function scholarshipImpactLine(audience: string) {
  const normalizedAudience = audience.toLowerCase();

  if (normalizedAudience.includes("sponsor") || normalizedAudience.includes("business")) {
    return "Sponsorship helps turn community support into scholarship opportunities for local students.";
  }

  if (normalizedAudience.includes("vendor")) {
    return "Vendor participation helps make the day feel welcoming, local, and full of community energy.";
  }

  if (normalizedAudience.includes("donor") || normalizedAudience.includes("auction")) {
    return "Every donated item helps build momentum for scholarships that support local students.";
  }

  if (normalizedAudience.includes("volunteer")) {
    return "Volunteer support helps create the kind of event families remember and students benefit from.";
  }

  return "Every family, business, and community member who shows up helps support scholarships for local students.";
}

function audienceKind(audience: string) {
  const normalizedAudience = audience.toLowerCase();

  if (normalizedAudience.includes("vendor")) return "vendor";
  if (normalizedAudience.includes("stick horse")) return "stick_horse";
  if (normalizedAudience.includes("sponsor") || normalizedAudience.includes("business")) {
    return "sponsor";
  }
  if (normalizedAudience.includes("donor") || normalizedAudience.includes("auction")) return "donor";
  if (normalizedAudience.includes("volunteer")) return "volunteer";
  if (normalizedAudience.includes("participant") || normalizedAudience.includes("families")) {
    return "attendee";
  }

  return "community";
}

function cleanContentType(value: string | undefined) {
  if (!value || /unconfirmed/i.test(value)) return undefined;

  return value;
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

function creativeGoalLine(audience: string, subject: string, purpose: string) {
  const value = `${subject} ${purpose}`.toLowerCase();
  const kind = audienceKind(audience);

  if (kind === "vendor") {
    if (value.includes("open") || value.includes("registration")) {
      return "Vendor registration is a chance to put your business in front of local families while helping fund scholarships for Dripping Springs students.";
    }

    return "Vendor participation brings local flavor to the event and gives small businesses a meaningful way to be seen by the community.";
  }

  if (kind === "stick_horse") {
    return "Stick Horse Showdown gives local businesses a fun, visible way to join the day and be part of the community story.";
  }

  if (kind === "sponsor") {
    return "Sponsorship is a visible community partnership: your business shows up for local families while helping create scholarship opportunities.";
  }

  if (kind === "donor") {
    return "Silent auction support gives the community another meaningful way to contribute to local scholarships.";
  }

  if (kind === "volunteer") {
    return "Volunteer support helps make the day organized, welcoming, and memorable for families.";
  }

  return "The event brings families, businesses, and neighbors together around a shared local purpose.";
}

function audienceDetailLines(campaign: Campaign, audience: string) {
  const kind = audienceKind(audience);
  const familyAttractions = factLabelValue(campaign, "Family attractions");
  const admission = factLabelValue(campaign, "Admission and parking");
  const dateTime = factLabelValue(campaign, "Date and time");
  const location = factLabelValue(campaign, "Location");
  const vendorPositioning = factLabelValue(campaign, "Vendor positioning");
  const vendorFees = factLabelValue(campaign, "Vendor fees");
  const stickHorsePositioning = factLabelValue(
    campaign,
    "Stick Horse Showdown positioning",
  );
  const stickHorseFee = factLabelValue(campaign, "Stick Horse Showdown fee");
  const booster = factLabelValue(campaign, "Rotary Booster");
  const silentAuction = factLabelValue(campaign, "Silent auction");

  if (kind === "vendor") {
    return [vendorPositioning, vendorFees].filter(Boolean) as string[];
  }

  if (kind === "stick_horse") {
    return [stickHorsePositioning, stickHorseFee].filter(Boolean) as string[];
  }

  if (kind === "donor") {
    return [silentAuction, booster].filter(Boolean) as string[];
  }

  return [dateTime, location, admission, familyAttractions].filter(Boolean) as string[];
}

function applyTerminologyRules(copy: string) {
  return copy
    .replace(/https?:\/\/(?:www\.)?backtoschoolrodeo\.com\/?/gi, "BackToSchoolRodeo")
    .replace(/\bBack to School Rodeo\b/g, "BackToSchoolRodeo");
}

function postTypeOpening(postType: string, audience: string, eventName: string) {
  if (postType === "Reel") {
    return `A quick look at why ${eventName} matters for ${audience}.`;
  }

  if (postType === "Carousel") {
    return `Swipe through the details ${audience} need for ${eventName}.`;
  }

  if (postType === "Story") {
    return `${eventName} update for ${audience}.`;
  }

  return `Calling ${audience}: ${eventName} is built by the community, for the community.`;
}

function postTypeExecutionLine(postType: string) {
  if (postType === "Reel") {
    return "Use this with a vertical video hook, clear captions, and visible human action in the first few seconds.";
  }

  if (postType === "Carousel") {
    return "Use this with a strong first slide, simple swipe-by-swipe details, and the CTA before the final slide.";
  }

  if (postType === "Story") {
    return "Use this with a countdown, poll, question, slider, or link sticker when available.";
  }

  return "Use this as an anchor caption for a clear 4:5 feed graphic.";
}

export function generatePlatformDrafts(
  campaign: Campaign,
  parseResult: FilenameParseResult,
  confirmedContentType: string,
  postType = "Post",
): PlatformDrafts {
  const eventName = factValue(campaign, "event_identity") ?? campaign.name;
  const beneficiary =
    factValue(campaign, "beneficiary") ??
    "Rotary Club of Dripping Springs community service efforts.";
  const purposeFact =
    factLabelValue(campaign, "Event purpose") ??
    "bring families and Rotary together around community impact.";
  const subject = parseResult.subject ?? "this Rotary update";
  const purpose = parseResult.assetPurpose ?? "community awareness";
  const contentType = cleanContentType(confirmedContentType) ?? cleanContentType(parseResult.contentType);
  const audience = audienceCue(contentType, subject);
  const impactLine = scholarshipImpactLine(audience);
  const goalLine = creativeGoalLine(audience, subject, purpose);
  const kind = audienceKind(audience);
  const detailLines = audienceDetailLines(campaign, audience);
  const facebookCta =
    kind === "vendor"
      ? "Vendor spaces are limited. Register through BackToSchoolRodeo to be considered."
      : kind === "stick_horse"
        ? "Register through BackToSchoolRodeo and get ready to race, send a teammate, or cheer on a crowd volunteer."
      : kind === "sponsor"
        ? "Reach out for the sponsorship packet and partnership options."
        : "Follow Rotary Club of Dripping Springs for official updates and ways to get involved.";
  const instagramCta =
    kind === "vendor"
      ? "Vendor details: BackToSchoolRodeo"
      : kind === "stick_horse"
        ? "Showdown details: BackToSchoolRodeo"
      : kind === "sponsor"
        ? "Partnership details: BackToSchoolRodeo"
        : "Event details: BackToSchoolRodeo";

  const facebook = [
      postTypeOpening(postType, audience, eventName),
      "",
      goalLine,
      "",
      ...detailLines.flatMap((line) => [line, ""]),
      postTypeExecutionLine(postType),
      "",
      `The heart of the event is simple: ${purposeFact}`,
      "",
      beneficiary,
      "",
      impactLine,
      "",
      facebookCta,
    ].join("\n");
  const instagram = [
      `${eventName} brings local action, family energy, and scholarship impact together.`,
      "",
      `Family-focused, community-powered, and rooted in local impact. ${goalLine}`,
      "",
      detailLines[0] ?? "",
      detailLines[0] ? "" : undefined,
      "Funds raised benefit the Dripping Springs High School Scholarship Fund.",
      "",
      instagramCta,
      "",
      "#DrippingSprings #RotaryClub #BackToSchoolRodeo #CommunityImpact",
    ].filter((line): line is string => line !== undefined).join("\n");

  return {
    facebook: applyTerminologyRules(facebook),
    instagram: applyTerminologyRules(instagram),
  };
}
