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
  if (audience.includes("sponsor") || audience.includes("business")) {
    return "Sponsorship helps turn community support into scholarship opportunities for local students.";
  }

  if (audience.includes("vendor")) {
    return "Vendor participation helps make the day feel welcoming, local, and full of community energy.";
  }

  if (audience.includes("donor") || audience.includes("auction")) {
    return "Every donated item helps build momentum for scholarships that support local students.";
  }

  if (audience.includes("volunteer")) {
    return "Volunteer support helps create the kind of event families remember and students benefit from.";
  }

  return "Every family, business, and community member who shows up helps support scholarships for local students.";
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

  if (audience.includes("vendor")) {
    if (value.includes("open") || value.includes("registration")) {
      return "Vendor registration is a chance to be part of a family-focused community event with local visibility built in.";
    }

    return "Vendor participation helps bring local flavor, energy, and connection to the event.";
  }

  if (audience.includes("sponsor") || audience.includes("business")) {
    return "Sponsorship is a visible way for local businesses to support students and show up for the community.";
  }

  if (audience.includes("donor") || audience.includes("auction")) {
    return "Silent auction support gives the community another meaningful way to contribute to local scholarships.";
  }

  if (audience.includes("volunteer")) {
    return "Volunteer support helps make the day organized, welcoming, and memorable for families.";
  }

  return "The event brings families, businesses, and neighbors together around a shared local purpose.";
}

function applyTerminologyRules(copy: string) {
  return copy
    .replace(/https?:\/\/(?:www\.)?backtoschoolrodeo\.com\/?/gi, "BackToSchoolRodeo")
    .replace(/\bBack to School Rodeo\b/g, "BackToSchoolRodeo");
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
  const subject = parseResult.subject ?? "this Rotary update";
  const purpose = parseResult.assetPurpose ?? "community awareness";
  const contentType = cleanContentType(confirmedContentType) ?? cleanContentType(parseResult.contentType);
  const audience = audienceCue(contentType, subject);
  const impactLine = scholarshipImpactLine(audience);
  const goalLine = creativeGoalLine(audience, subject, purpose);

  const facebook = [
      `There is a place for ${audience} at ${eventName}.`,
      "",
      goalLine,
      "",
      `The heart of the event is simple: ${purposeFact}`,
      "",
      beneficiary,
      "",
      impactLine,
      "",
      "Follow Rotary Club of Dripping Springs for official updates and ways to get involved.",
    ].join("\n");
  const instagram = [
      `Community comes together at ${eventName}.`,
      "",
      `Family-focused, community-powered, and rooted in local impact. ${goalLine}`,
      "",
      "Funds raised benefit the Dripping Springs High School Scholarship Fund.",
      "",
      "#DrippingSprings #RotaryClub #BackToSchoolRodeo #CommunityImpact",
    ].join("\n");

  return {
    facebook: applyTerminologyRules(facebook),
    instagram: applyTerminologyRules(instagram),
  };
}
