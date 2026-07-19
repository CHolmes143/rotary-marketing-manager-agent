import { approvedFacts, type Campaign } from "@/lib/rotary-data";
import type { FilenameParseResult } from "@/lib/filename-parser";

export type PlatformDrafts = {
  facebook: string;
  instagram: string;
};

export type CopyLearningSignal = {
  postType: string;
  contentType: string;
  subject: string;
  aiDraft: string;
  finalCopy: string;
  editReason: string;
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

function publicDetailLines(campaign: Campaign, audience: string) {
  const kind = audienceKind(audience);
  const dateTime = factLabelValue(campaign, "Date and time");
  const location = factLabelValue(campaign, "Location");
  const vendorFees = factLabelValue(campaign, "Vendor fees");
  const stickHorseFee = factLabelValue(campaign, "Stick Horse Showdown fee");

  if (kind === "vendor") {
    return [
      "Set up your business where hundreds of Dripping Springs families will already be spending the day.",
      vendorFees ? vendorFees.replace("Vendor fees are tax-deductible donations: ", "Booth fees: ") : undefined,
    ].filter(Boolean) as string[];
  }

  if (kind === "stick_horse") {
    return [
      "Sponsor a stick horse, race it yourself, send a teammate, or cheer on a crowd volunteer.",
      stickHorseFee,
    ].filter(Boolean) as string[];
  }

  return [
    dateTime,
    location ? location.replace(", 5330 Bell Springs Road, Dripping Springs, Texas.", "") : undefined,
    "Free parking. Free admission. Family fun that helps fund local scholarships.",
  ].filter(Boolean) as string[];
}

function applyTerminologyRules(copy: string) {
  return copy
    .replace(/https?:\/\/(?:www\.)?backtoschoolrodeo\.com\/?/gi, "BackToSchoolRodeo")
    .replace(/\bBack to School Rodeo\b/g, "BackToSchoolRodeo")
    .replace(/\bStickHorse\b/g, "Stick Horse")
    .replace(/\bStickhorse\b/g, "Stick Horse")
    .replace(/[—–]/g, ",")
    .replace(/\bfair\b/gi, "event");
}

function relevantLearningSignals(
  signals: CopyLearningSignal[],
  postType: string,
  audience: string,
  subject: string,
) {
  const normalizedAudience = audience.toLowerCase();
  const normalizedSubject = subject.toLowerCase();
  const audienceKeywords = normalizedAudience
    .split(/\W+/)
    .filter((word) => word.length > 4);

  return signals
    .filter((signal) => {
      const haystack = `${signal.postType} ${signal.contentType} ${signal.subject}`.toLowerCase();
      const matchesAudience = audienceKeywords.some((word) =>
        haystack.includes(word),
      );
      const matchesSubject =
        normalizedSubject.length > 4 && haystack.includes(normalizedSubject);

      return (
        matchesSubject ||
        (signal.postType === postType && matchesAudience)
      );
    })
    .slice(0, 8);
}

function extractQuotedPhrases(value: string) {
  return Array.from(value.matchAll(/["']([^"']{4,160})["']/g), (match) =>
    match[1].trim(),
  );
}

function extractAvoidancePhrases(reason: string) {
  const phrases = extractQuotedPhrases(reason);
  const avoidMatches = Array.from(
    reason.matchAll(
      /\b(?:do not|don't|dont|never|avoid|remove|stop)\s+(?:use|using|say|saying|include|including)?\s*([^.!?\n]{4,160})/gi,
    ),
    (match) => match[1].trim(),
  );

  return [...phrases, ...avoidMatches]
    .map(applyTerminologyRules)
    .map((phrase) => phrase.replace(/^this\s+/i, "").trim())
    .filter((phrase) => phrase.length >= 4);
}

function rejectedDraftLines(signal: CopyLearningSignal) {
  if (!signal.editReason.trim()) return [];

  const finalCopy = signal.finalCopy.toLowerCase();

  return signal.aiDraft
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length >= 24)
    .filter((line) => !finalCopy.includes(line.toLowerCase()))
    .slice(0, 4);
}

function removeLearnedAvoidances(copy: string, signals: CopyLearningSignal[]) {
  const avoidances = signals.flatMap((signal) => [
    ...extractAvoidancePhrases(signal.editReason),
    ...rejectedDraftLines(signal),
  ]);

  if (avoidances.length === 0) return copy;

  return copy
    .split("\n")
    .filter((line) => {
      const normalizedLine = line.toLowerCase();

      return !avoidances.some((avoidance) => {
        const normalizedAvoidance = avoidance.toLowerCase();

        return (
          normalizedAvoidance.length >= 8 &&
          (normalizedLine.includes(normalizedAvoidance) ||
            normalizedAvoidance.includes(normalizedLine))
        );
      });
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function ownerApprovedOpening(signals: CopyLearningSignal[]) {
  return signals
    .map((signal) => signal.finalCopy.split(/\n+/)[0]?.trim() ?? "")
    .map(applyTerminologyRules)
    .find((line) => line.length >= 18 && line.length <= 170);
}

function safeCreativeHook(hookIdeas: string[]) {
  const blockedPhrases = [
    "creative context",
    "average brightness",
    "sampled",
    "use this with",
    "analysis",
    "metadata",
    "detected text",
    "visual summary",
    "frame",
    "fair",
  ];

  const selectedHook = hookIdeas.find((hook) => {
    const cleanedHook = applyTerminologyRules(hook);
    const normalizedHook = cleanedHook.toLowerCase();

    return (
      cleanedHook.trim().length >= 18 &&
      cleanedHook.trim().length <= 170 &&
      !blockedPhrases.some((phrase) => normalizedHook.includes(phrase))
    );
  });

  return selectedHook ? applyTerminologyRules(selectedHook).trim() : undefined;
}

function postTypeOpening(
  postType: string,
  audience: string,
  eventName: string,
  hookIdeas: string[],
  learningSignals: CopyLearningSignal[],
) {
  const approvedOpening = ownerApprovedOpening(learningSignals);
  if (approvedOpening) return approvedOpening;

  const creativeHook = safeCreativeHook(hookIdeas);
  if (creativeHook) return creativeHook;

  const kind = audienceKind(audience);

  if (postType === "Reel") {
    if (kind === "vendor") {
      return "Vendor spaces are open, and this is the kind of local crowd small businesses want to be in front of.";
    }

    if (kind === "stick_horse") {
      return "Your business could be the one everyone is cheering for in the Stick Horse Showdown.";
    }

    if (kind === "sponsor") {
      return "Put your business where the community is already gathering.";
    }

    return "Free admission, live music, family fun, and an event day that helps fund local scholarships.";
  }

  if (postType === "Carousel") {
    return `Save this: the key details for ${eventName} are all in one place.`;
  }

  if (postType === "Story") {
    return "Quick reminder before this gets buried in your feed.";
  }

  return `Calling ${audience}: this community event is almost here.`;
}

export function generatePlatformDrafts(
  campaign: Campaign,
  parseResult: FilenameParseResult,
  confirmedContentType: string,
  postType = "Post",
  hookIdeas: string[] = [],
  learningSignals: CopyLearningSignal[] = [],
): PlatformDrafts {
  const eventName = factValue(campaign, "event_identity") ?? campaign.name;
  const beneficiary =
    factValue(campaign, "beneficiary") ??
    "Rotary Club of Dripping Springs community service efforts.";
  const subject = parseResult.subject ?? "this Rotary update";
  const purpose = parseResult.assetPurpose ?? "community awareness";
  const contentType = cleanContentType(confirmedContentType) ?? cleanContentType(parseResult.contentType);
  const audience = audienceCue(contentType, subject);
  const impactLine = scholarshipImpactLine(audience);
  const goalLine = creativeGoalLine(audience, subject, purpose);
  const kind = audienceKind(audience);
  const detailLines = publicDetailLines(campaign, audience);
  const relevantSignals = relevantLearningSignals(
    learningSignals,
    postType,
    audience,
    subject,
  );
  const facebookCta =
    kind === "vendor"
      ? "Reserve your vendor space at BackToSchoolRodeo."
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
      postTypeOpening(postType, audience, eventName, hookIdeas, relevantSignals),
      "",
      ...(kind === "vendor" || kind === "stick_horse" ? [] : [goalLine, ""]),
      ...detailLines.slice(0, 3).flatMap((line) => [line, ""]),
      kind === "vendor" || kind === "stick_horse" ? "" : beneficiary,
      kind === "vendor" || kind === "stick_horse" ? undefined : "",
      kind === "vendor" || kind === "stick_horse" ? impactLine : undefined,
      kind === "vendor" || kind === "stick_horse" ? "" : undefined,
      "",
      facebookCta,
    ].filter((line): line is string => line !== undefined).join("\n").replace(/\n{3,}/g, "\n\n");
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
    facebook: applyTerminologyRules(removeLearnedAvoidances(facebook, relevantSignals)),
    instagram: applyTerminologyRules(removeLearnedAvoidances(instagram, relevantSignals)),
  };
}
