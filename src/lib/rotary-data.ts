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
  sourceUrl?: string;
  accessNote: string;
  capturedFrom: string;
  extractedText?: string;
  summary?: string;
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
          "Funds raised benefit the Dripping Springs High School Scholarship Fund and support local students through scholarships.",
        status: "approved",
        stability: "annual_review",
      },
      {
        id: "fact-purpose",
        category: "event_identity",
        label: "Event purpose",
        value:
          "Bring families and the Rotary Club of Dripping Springs together, increase community awareness of Rotary, and raise funds for the Dripping Springs High School Scholarship Fund.",
        status: "approved",
        stability: "annual_review",
      },
      {
        id: "fact-primary-objectives",
        category: "other",
        label: "Primary objectives",
        value:
          "Raise scholarship funds, increase awareness of Rotary Club of Dripping Springs, create a fun family-focused community event, and encourage long-term community involvement with Rotary.",
        status: "approved",
        stability: "annual_review",
      },
      {
        id: "fact-target-audiences",
        category: "audience",
        label: "Target audiences",
        value:
          "Event attendees and local families; sponsors and prospective sponsors; vendors and prospective vendors; Stick Horse Showdown participants; silent auction donors; Rotary supporters and boosters; event volunteers; scholarship supporters; thank-you and recognition audiences.",
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
          "Polished, professional, friendly, approachable, family-oriented, community-focused, welcoming rather than sales-heavy, positive, energetic, and authentic.",
        status: "approved",
        stability: "permanent",
      },
      {
        id: "fact-core-messaging",
        category: "voice",
        label: "Core messaging",
        value:
          "When appropriate, reinforce that the event benefits the Dripping Springs High School Scholarship Fund, supports local students through scholarships, is hosted by Rotary Club of Dripping Springs, and succeeds because families, businesses, and community members participate.",
        status: "approved",
        stability: "annual_review",
      },
      {
        id: "fact-reference-website",
        category: "cta",
        label: "Reference website",
        value:
          "Use https://backtoschoolrodeo.com as the primary public reference for established tone, messaging style, and branding.",
        status: "approved",
        stability: "annual_review",
      },
      {
        id: "fact-agent-guidance",
        category: "voice",
        label: "Agent guidance",
        value:
          "Identify the audience first and tailor messaging accordingly. Avoid overly corporate language or aggressive sales tactics. Focus on community, participation, generosity, and positive local impact.",
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
    title: "Rotary Rodeo Marketing Agent Brand Foundation Phase 1",
    sourceType: "uploaded_file",
    scope: "campaign",
    status: "ingested",
    sourceUrl:
      "file:/Users/carissaholmes/Downloads/Rotary_Rodeo_Marketing_Agent_Brand_Foundation_Phase1.docx",
    accessNote:
      "Brand foundation document supplied by owner and ingested into Phase 1 campaign knowledge.",
    capturedFrom:
      "Local DOCX upload, July 17, 2026",
    summary:
      "Defines purpose, objectives, target audiences, brand voice, core messaging, website reference, channels, and agent guidance for Back to School Rotary Rodeo marketing.",
    extractedText:
      "Purpose: bring families and Rotary Club of Dripping Springs together, increase community awareness of Rotary, and raise funds for the Dripping Springs High School Scholarship Fund. Primary objectives: raise scholarship funds, increase Rotary awareness, create a fun family-focused community event, and encourage long-term community involvement. Target audiences: event attendees and local families; sponsors and prospective sponsors; vendors and prospective vendors; Stick Horse Showdown participants; silent auction donors; Rotary supporters and boosters; event volunteers; scholarship supporters; thank-you and recognition posts. Brand voice: polished, professional, friendly, approachable, family-oriented, community-focused, welcoming rather than sales-heavy, positive, energetic, and authentic. Core messaging: event benefits the Dripping Springs High School Scholarship Fund; funds raised support local students through scholarships; event is hosted by Rotary Club of Dripping Springs; families, businesses, and community members all help make the event successful. Reference website: https://backtoschoolrodeo.com. Marketing channels: Facebook and Instagram. Agent guidance: identify the audience first and tailor messaging accordingly while staying consistent with brand voice; avoid overly corporate language or aggressive sales tactics; focus on community, participation, generosity, and positive local impact.",
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
