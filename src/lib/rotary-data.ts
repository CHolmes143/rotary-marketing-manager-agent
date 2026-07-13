export type FactStatus = "draft" | "approved" | "expired" | "archived";

export type FactStability = "permanent" | "annual_review" | "temporary";

export type CampaignFact = {
  id: string;
  category: string;
  label: string;
  value: string;
  status: FactStatus;
  stability: FactStability;
};

export type ContentTypeGroup = {
  group: string;
  items: string[];
};

export type Campaign = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  status: "active" | "draft" | "archived";
  facts: CampaignFact[];
};

export type TrainingSource = {
  id: string;
  campaignSlug: string;
  title: string;
  sourceType: "google_drive_doc" | "uploaded_file" | "manual_note";
  scope: "campaign" | "rotary_wide";
  status: "pending_ingestion" | "ingested" | "archived";
  accessNote: string;
  capturedFrom: string;
};

export const contentTaxonomy: ContentTypeGroup[] = [
  {
    group: "Recruitment and Acquisition",
    items: [
      "Vendor recruitment",
      "Sponsor recruitment",
      "Silent auction donation requests",
      "Volunteer recruitment",
      "Participant or team registration",
    ],
  },
  {
    group: "Event Awareness and Attendance",
    items: [
      "General event promotion",
      "Save-the-date",
      "Countdowns",
      "Attraction teasers",
      "Entertainment announcements",
      "Family activity promotion",
    ],
  },
  {
    group: "Features and Recognition",
    items: [
      "Vendor spotlights",
      "Sponsor recognition",
      "Silent auction donor recognition",
      "Entertainment or attraction features",
      "Rotary member or volunteer features",
    ],
  },
  {
    group: "Fundraising and Auction Promotion",
    items: [
      "Silent auction item promotion",
      "Scholarship-fund messaging",
      "Rotary Booster promotion",
      "Fundraising progress or calls to action",
    ],
  },
  {
    group: "Community Impact",
    items: [
      "Scholarship recipient stories",
      "Meet prior scholarship recipients",
      "How funds are used",
      "Rotary community-service impact",
    ],
  },
  {
    group: "Logistics and Conversion",
    items: [
      "Registration deadlines",
      "Vendor instructions",
      "Event hours and location",
      "Parking or arrival details",
      "What to expect",
      "Final reminders",
    ],
  },
  {
    group: "Event-Day and Post-Event",
    items: [
      "Live event updates",
      "Event-day reminders",
      "Thank-you posts",
      "Sponsor and volunteer appreciation",
      "Impact recap",
      "Photo and video recap",
    ],
  },
  {
    group: "General Rotary Visibility",
    items: [
      "Club initiatives",
      "Membership visibility",
      "Service projects",
      "Community partnerships",
      "Year-round Rotary presence",
    ],
  },
];

export const contentTypeAliases = new Map<string, string>(
  contentTaxonomy
    .flatMap((group) => group.items)
    .flatMap((item) => [
      [normalizeToken(item), item] as const,
      [normalizeToken(item.replace(" and ", " ")), item] as const,
    ])
    .concat([
      ["sponsorrecruitment", "Sponsor recruitment"],
      ["vendorrecruitment", "Vendor recruitment"],
      ["silentauctiondonationrequests", "Silent auction donation requests"],
      ["volunteerrecruitment", "Volunteer recruitment"],
      ["participantregistration", "Participant or team registration"],
      ["teamregistration", "Participant or team registration"],
      ["generaleventpromotion", "General event promotion"],
      ["savethedate", "Save-the-date"],
      ["attractionteasers", "Attraction teasers"],
      ["sponsorrecognition", "Sponsor recognition"],
      ["scholarshipfundmessaging", "Scholarship-fund messaging"],
      ["eventhourslocation", "Event hours and location"],
      ["finalreminders", "Final reminders"],
      ["photorecap", "Photo and video recap"],
      ["videorecap", "Photo and video recap"],
    ]),
);

export const campaigns: Campaign[] = [
  {
    id: "campaign-rodeo-2026",
    name: "Back to School Rotary Rodeo",
    slug: "back-to-school-rotary-rodeo",
    shortDescription:
      "First configured Rotary campaign for community event promotion, recruitment, recognition, and scholarship-fund messaging.",
    status: "active",
    facts: [
      {
        id: "fact-event-identity",
        category: "event_identity",
        label: "Event identity",
        value: "Back to School Rotary Rodeo",
        status: "approved",
        stability: "permanent",
      },
      {
        id: "fact-beneficiary",
        category: "beneficiary",
        label: "Beneficiary",
        value:
          "Funds support Rotary Club of Dripping Springs community service and scholarship efforts.",
        status: "approved",
        stability: "annual_review",
      },
      {
        id: "fact-location",
        category: "location",
        label: "Location",
        value: "Dripping Springs, Texas",
        status: "draft",
        stability: "annual_review",
      },
      {
        id: "fact-date",
        category: "date_time",
        label: "Date and time",
        value: "Placeholder date and time pending owner approval.",
        status: "draft",
        stability: "annual_review",
      },
      {
        id: "fact-cta",
        category: "cta",
        label: "Primary CTA",
        value: "Watch for official Rotary updates and registration details.",
        status: "draft",
        stability: "temporary",
      },
      {
        id: "fact-voice",
        category: "voice",
        label: "Brand voice",
        value:
          "Warm, civic-minded, clear, and community-first. Avoid pressure-heavy sales language.",
        status: "approved",
        stability: "permanent",
      },
      {
        id: "fact-prohibited",
        category: "prohibited_claim",
        label: "Prohibited claims",
        value:
          "Do not invent sponsors, prices, deadlines, attractions, outcomes, or participating organizations.",
        status: "approved",
        stability: "permanent",
      },
    ],
  },
];

export const trainingSources: TrainingSource[] = [
  {
    id: "source-rotary-rodeo-brand-voice",
    campaignSlug: "back-to-school-rotary-rodeo",
    title: "Rotary Rodeo Brand Voice",
    sourceType: "google_drive_doc",
    scope: "campaign",
    status: "pending_ingestion",
    accessNote:
      "Captured from Google Drive share dialog. The document is link-viewable, but text/link still needs to be ingested before it can guide generation.",
    capturedFrom:
      "Google Drive > Rotary Workforce > Content Team screenshot, July 13, 2026",
  },
];

export function normalizeToken(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function approvedFacts(campaign: Campaign) {
  return campaign.facts.filter((fact) => fact.status === "approved");
}

export function draftFacts(campaign: Campaign) {
  return campaign.facts.filter((fact) => fact.status !== "approved");
}
