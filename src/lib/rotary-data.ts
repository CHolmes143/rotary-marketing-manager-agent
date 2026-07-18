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
        value:
          "Dripping Springs Distilling, 5330 Bell Springs Road, Dripping Springs, Texas.",
        status: "approved",
        stability: "annual_review",
      },
      {
        id: "fact-date",
        category: "date_time",
        label: "Date and time",
        value: "Saturday, September 5, 2026, from 12PM to 6PM.",
        status: "approved",
        stability: "annual_review",
      },
      {
        id: "fact-cta",
        category: "cta",
        label: "Primary CTA",
        value: "Use BackToSchoolRodeo for official event details and calls to action.",
        status: "approved",
        stability: "temporary",
      },
      {
        id: "fact-admission",
        category: "pricing",
        label: "Admission and parking",
        value: "Free parking and free admission.",
        status: "approved",
        stability: "annual_review",
      },
      {
        id: "fact-family-attractions",
        category: "attraction",
        label: "Family attractions",
        value:
          "Vendors, silent auction, live horses, Stick Horse Races, live music, Rotary Prize Wheel, and bounce house.",
        status: "approved",
        stability: "annual_review",
      },
      {
        id: "fact-vendor-positioning",
        category: "vendor",
        label: "Vendor positioning",
        value:
          "Vendor audience is primarily families with children ages 0 to 15 who spend several hours at the event. Vendors receive 6 hours to promote products and services to hundreds of local families, with a steady attendee flow from 1PM on.",
        status: "approved",
        stability: "annual_review",
      },
      {
        id: "fact-vendor-fees",
        category: "pricing",
        label: "Vendor fees",
        value:
          "Vendor fees are tax-deductible donations: businesses are $50 and non-profit organizations are $30.",
        status: "approved",
        stability: "annual_review",
      },
      {
        id: "fact-vendor-logistics",
        category: "vendor",
        label: "Vendor logistics",
        value:
          "Vendor setup begins at 11AM. Event runs 12PM to 6PM. Cleanup/pack-up is 6PM to 7PM. Setup/pack-up assistance will be available. Vendors can unload close to their setup area before parking for the event. Event is rain or shine. Vendors needing electricity should bring their own power source.",
        status: "approved",
        stability: "annual_review",
      },
      {
        id: "fact-vendor-fit",
        category: "vendor",
        label: "Vendor fit",
        value:
          "The event is a casual western rodeo that is fun for the whole family, including older and middle-school-aged children. Local eats, treats, leather accessories, unique finds, and community organizations fit the event. Food vendors are discouraged because Dripping Springs Distilling has a full menu, but treats like cotton candy and snow cones are a strong fit. Non-profits and service vendors should offer a simple kid-friendly activity at the table.",
        status: "approved",
        stability: "annual_review",
      },
      {
        id: "fact-stick-horse-positioning",
        category: "attraction",
        label: "Stick Horse Showdown positioning",
        value:
          "Stick Horse Showdown is an event-day race where local professionals and businesses compete for bragging rights and community recognition by sponsoring a stick horse while putting their brand in front of hundreds of Dripping Springs families.",
        status: "approved",
        stability: "annual_review",
      },
      {
        id: "fact-stick-horse-fee",
        category: "pricing",
        label: "Stick Horse Showdown fee",
        value: "Stick Horse Showdown sponsorship registration fee is a $100 tax-deductible donation.",
        status: "approved",
        stability: "annual_review",
      },
      {
        id: "fact-stick-horse-participation",
        category: "attraction",
        label: "Stick Horse Showdown participation",
        value:
          "Sponsors may show up and race, send a teammate, or let Rotary find a volunteer from the crowd while the sponsor cheers them on. Rotary will provide event updates and ready-to-share social media assets before the event.",
        status: "approved",
        stability: "annual_review",
      },
      {
        id: "fact-booster",
        category: "cta",
        label: "Rotary Booster",
        value:
          "Rotary Booster donors who give $25 or more can be named on the large event-day Thank You Banner.",
        status: "approved",
        stability: "annual_review",
      },
      {
        id: "fact-silent-auction",
        category: "cta",
        label: "Silent auction",
        value: "Silent auction supporters may donate a product, service, or experience.",
        status: "approved",
        stability: "annual_review",
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
          "Use scholarship impact, Rotary Club of Dripping Springs host credibility, and community participation as underlying themes. Do not quote internal messaging guidance verbatim in public copy.",
        status: "approved",
        stability: "annual_review",
      },
      {
        id: "fact-reference-website",
        category: "cta",
        label: "Reference website",
        value:
          "Use BackToSchoolRodeo as the preferred public-facing event site wording. Use https://backtoschoolrodeo.com only as an internal reference for established tone, messaging style, and branding.",
        status: "approved",
        stability: "annual_review",
      },
      {
        id: "fact-site-terminology",
        category: "terminology",
        label: "Event site wording",
        value:
          "When the event site is provided in copy, write it as BackToSchoolRodeo.",
        status: "approved",
        stability: "permanent",
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
        id: "fact-rotary-voice-framework",
        category: "voice",
        label: "Rotary voice framework",
        value:
          "Represent Rotary as persevering, inspiring, compassionate, and smart. Use People of Action framing: show Rotary members and community partners actively solving local challenges rather than positioning Rotary as a passive funder.",
        status: "approved",
        stability: "permanent",
      },
      {
        id: "fact-nonprofit-story-formula",
        category: "voice",
        label: "Nonprofit story formula",
        value:
          "For impact stories, center one relatable person or group, explain the local challenge with dignity, show the Rotary Rodeo as the mechanism of support, name a specific positive outcome when facts are available, and invite the reader to continue that impact through tickets, sponsorship, vendor participation, donations, volunteering, or sharing.",
        status: "approved",
        stability: "permanent",
      },
      {
        id: "fact-platform-copy-rules",
        category: "voice",
        label: "Facebook and Instagram copy rules",
        value:
          "Treat Facebook and Instagram as delivery channels after the correct post format is selected. During this phase, use the same approved copy for matching Meta formats such as Reels, Posts, Stories, and Carousels, then optimize future learning by post type and performance.",
        status: "approved",
        stability: "permanent",
      },
      {
        id: "fact-post-type-routing",
        category: "creative_strategy",
        label: "Post type routing",
        value:
          "Route creative by format before platform. Reels fit raw, human-focused, dynamic video that can open with an immediate hook. Carousels fit sequential, educational, before-and-after, data, or step-by-step content. Static Feed Posts fit permanent brand updates, milestones, partnership announcements, merchandise launches, and single high-clarity event graphics. Stories fit urgent reminders, deadline/countdown alerts, casual behind-the-scenes updates, and interactive mobile actions. Live Video fits real-time interactive broadcasts, panels, or field updates.",
        status: "approved",
        stability: "permanent",
      },
      {
        id: "fact-reel-guidance",
        category: "creative_strategy",
        label: "Reel guidance",
        value:
          "Reels are reach-first and should use authentic motion, a human face or clear action in the first three seconds, vertical 9:16 framing, high-contrast captions, direct shares, and a short narrative arc. Avoid abstract, over-produced, confusing metaphors that distance viewers from the people or event.",
        status: "approved",
        stability: "permanent",
      },
      {
        id: "fact-hook-and-brevity-guidance",
        category: "voice",
        label: "Hook and brevity guidance",
        value:
          "Public copy must open with a strong, specific hook rather than a soft explainer such as 'A quick look at why...'. Do not include internal analysis, creative metadata, execution notes, or stacked event facts in the public caption. Use only the most relevant facts for the audience and post type, then move quickly to the ask.",
        status: "approved",
        stability: "permanent",
      },
      {
        id: "fact-carousel-guidance",
        category: "creative_strategy",
        label: "Carousel guidance",
        value:
          "Carousels are engagement, education, saves, and shares-first. Use 5 to 7 visually consistent slides, a strong first-slide hook, bite-sized information, swipe logic, and an early CTA. Avoid disconnected slides, dense paragraphs, and inconsistent branding.",
        status: "approved",
        stability: "permanent",
      },
      {
        id: "fact-static-post-guidance",
        category: "creative_strategy",
        label: "Static Feed Post guidance",
        value:
          "Static Feed Posts should anchor high-clarity announcements, event details, milestones, and partnership recognition. Use one strong visual, clear contrast, 4:5 portrait framing, keyword-rich captioning, and community interaction after posting. Avoid repetitive flyer-only posting when the image lacks original, outcome-focused, or human context.",
        status: "approved",
        stability: "permanent",
      },
      {
        id: "fact-story-guidance",
        category: "creative_strategy",
        label: "Story guidance",
        value:
          "Stories should support urgent, casual, or interactive updates. Use short vertical frames, countdowns, polls, questions, sliders, and link stickers when relevant. Keep important text, faces, and graphics away from the top 15 percent and bottom 20 percent of the frame.",
        status: "approved",
        stability: "permanent",
      },
      {
        id: "fact-creative-technical-specs",
        category: "creative_strategy",
        label: "Creative technical specs",
        value:
          "Use 9:16 vertical format at 1080 x 1920 for Reels and Stories. Use 4:5 portrait format at 1080 x 1350 for Feed Posts and Carousels. Avoid landscape crops when possible because they take less vertical screen space and reduce scroll-stopping power.",
        status: "approved",
        stability: "permanent",
      },
      {
        id: "fact-copy-frameworks",
        category: "voice",
        label: "Copywriting frameworks",
        value:
          "Use AIDA for broad attendee awareness and ticket interest; PASO for urgent vendor, sponsorship, deadline, or availability posts; BAB for storytelling, sponsor validation, and thank-you or stewardship posts. Always include a clear reason behind the ask and prefer concrete details over vague claims.",
        status: "approved",
        stability: "permanent",
      },
      {
        id: "fact-vendor-copy-guidance",
        category: "audience",
        label: "Vendor copy guidance",
        value:
          "Vendor copy should speak to expected foot traffic, booth value, simple registration, setup/logistics, category protection when known, and local visibility. Treat calls for vendors as practical value propositions, not sponsorship appeals.",
        status: "approved",
        stability: "permanent",
      },
      {
        id: "fact-sponsor-copy-guidance",
        category: "audience",
        label: "Sponsor copy guidance",
        value:
          "Sponsor copy should frame sponsorship as a strategic community partnership with local brand exposure, social proof, civic trust, and scholarship impact. Emphasize collaboration and visibility, not generic donation language.",
        status: "approved",
        stability: "permanent",
      },
      {
        id: "fact-attendee-copy-guidance",
        category: "audience",
        label: "Attendee copy guidance",
        value:
          "Attendee copy should balance family-friendly entertainment, community tradition, clear logistics, official buying paths, and scholarship impact. Use direct official links on Facebook and link-in-bio style direction on Instagram when a clickable feed link is not available.",
        status: "approved",
        stability: "permanent",
      },
      {
        id: "fact-specificity-rule",
        category: "prohibited_claim",
        label: "Specificity rule",
        value:
          "Use exact dates, times, prices, venue details, ticket/vendor/sponsor benefits, and measurable outcomes only when they are supplied or approved. Never invent attendance numbers, scholarship amounts, sponsor tiers, deadlines, category caps, venue infrastructure, or Meta performance claims.",
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
      "Purpose: bring families and Rotary Club of Dripping Springs together, increase community awareness of Rotary, and raise funds for the Dripping Springs High School Scholarship Fund. Primary objectives: raise scholarship funds, increase Rotary awareness, create a fun family-focused community event, and encourage long-term community involvement. Target audiences: event attendees and local families; sponsors and prospective sponsors; vendors and prospective vendors; Stick Horse Showdown participants; silent auction donors; Rotary supporters and boosters; event volunteers; scholarship supporters; thank-you and recognition posts. Brand voice: polished, professional, friendly, approachable, family-oriented, community-focused, welcoming rather than sales-heavy, positive, energetic, and authentic. Core messaging: event benefits the Dripping Springs High School Scholarship Fund; funds raised support local students through scholarships; event is hosted by Rotary Club of Dripping Springs; families, businesses, and community members all help make the event successful. Reference website: https://backtoschoolrodeo.com. Public event site wording: BackToSchoolRodeo. Marketing channels: Facebook and Instagram. Agent guidance: identify the audience first and tailor messaging accordingly while staying consistent with brand voice; avoid overly corporate language or aggressive sales tactics; focus on community, participation, generosity, and positive local impact.",
  },
  {
    id: "source-nonprofit-social-copy-framework",
    campaignSlug: "back-to-school-rotary-rodeo",
    title:
      "Professional Training Manual and Operational Plan: Facebook and Instagram Copywriting and Marketing Framework",
    sourceType: "uploaded_file",
    scope: "rotary_wide",
    status: "ingested",
    sourceUrl:
      "file:/Users/carissaholmes/.codex/attachments/a05a6193-5e2f-42a8-8155-620ce4e2019f/pasted-text.txt",
    accessNote:
      "Nonprofit social media copywriting framework supplied by owner and ingested as ongoing agent training.",
    capturedFrom: "Pasted training manual, July 18, 2026",
    summary:
      "Adds Rotary People of Action brand framing, platform-specific Facebook and Instagram rules, AIDA/PASO/BAB copy structures, audience strategies for attendees/sponsors/vendors, specificity safeguards, and future Meta performance tracking guidance.",
    extractedText:
      "Use Rotary's Service Above Self identity and People of Action framing. Voice attributes are persevering, inspiring, compassionate, and smart. Tell nonprofit impact stories through protagonist focus, relatable local problem, turning point, specific outcome, and supporter invitation. Facebook can carry fuller context, direct links, comment/share prompts, and 1 to 2 relevant hashtags. Instagram should be shorter, visual-first, save/share-oriented, with link-in-bio direction and hashtag blocks outside the main narrative when appropriate. Use AIDA for broad attendee/ticket awareness, PASO for urgency-driven vendor/sponsor/deadline posts, and BAB for storytelling, sponsor validation, and stewardship. Segment copy for attendees, sponsors, and vendors: attendees need family entertainment plus scholarship impact and official buying paths; sponsors need community partnership, brand exposure, CSR value, and proof of visibility; vendors need foot traffic, booth value, simple application, logistics, category protection when approved, and local visibility. Use specific facts and a clear reason behind each ask, but never invent attendance, prices, scholarship amounts, deadlines, sponsor benefits, category caps, logistics, or performance claims. Future optimization should connect creative asset, suggested copy, finalized copy, and Meta performance metrics such as reach, impressions, engagement, saves, shares, comments, CTR, website clicks, and sponsor-specific visibility.",
  },
  {
    id: "source-back-to-school-rodeo-website-review",
    campaignSlug: "back-to-school-rotary-rodeo",
    title: "BackToSchoolRodeo Website Audience Positioning Review",
    sourceType: "manual_note",
    scope: "campaign",
    status: "ingested",
    sourceUrl: "https://www.backtoschoolrodeo.com",
    accessNote:
      "Public event website reviewed and converted into audience-specific campaign knowledge.",
    capturedFrom:
      "BackToSchoolRodeo website pages: home, vendors, sponsorships, stick-horse-showdown, and booster. Reviewed July 18, 2026.",
    summary:
      "Adds official event date, time, venue, free admission/parking, family attractions, vendor positioning and logistics, Stick Horse Showdown positioning, Booster donor positioning, and silent auction call-to-action details.",
    extractedText:
      "Annual Back-To-School Rotary Rodeo is Saturday, September 5, 2026, 12PM to 6PM at Dripping Springs Distilling. Website emphasizes free parking and admission, vendors, silent auction, live horses, Stick Horse Races, live music, Rotary Prize Wheel, and bounce house. Vendors are positioned around 6 hours of promoting products and services to hundreds of local families. Vendor fees are tax-deductible donations: businesses $50 and non-profits $30. Vendor setup begins at 11AM; event runs 12PM to 6PM; cleanup is 6PM to 7PM; setup/pack-up assistance available; address is 5330 Bell Springs Road, Dripping Springs, Texas; event is rain or shine. Attendees are primarily families with children ages 0 to 15 and spend several hours at the event, with steady flow from 1PM on. Event vibe is a casual western rodeo for the whole family. Non-profits/service vendors should offer a simple kid-friendly activity. Dripping Springs Distilling has a menu, so full food vendors are discouraged; treats like cotton candy and snow cones fit well. Stick Horse Showdown is for local professionals and businesses to compete for bragging rights and community recognition by sponsoring a stick horse while putting their brand in front of hundreds of Dripping Springs families. Stick Horse sponsorship is a $100 tax-deductible donation. Sponsors can race, send a teammate, or have a crowd volunteer race while they cheer. Rotary Booster donors who give $25 or more can be named on the large event-day Thank You Banner. Silent auction supporters can donate a product, service, or experience.",
  },
  {
    id: "source-rotary-creative-process-post-type-report",
    campaignSlug: "back-to-school-rotary-rodeo",
    title:
      "The Rotary Creative Process: Algorithmic and Decision-Making Report on Nonprofit Social Media Optimization",
    sourceType: "uploaded_file",
    scope: "rotary_wide",
    status: "ingested",
    sourceUrl:
      "file:/Users/carissaholmes/.codex/attachments/c5ba4dd4-16b0-45e1-893d-8ddafff6d102/pasted-text.txt",
    accessNote:
      "Post-type-first creative process report supplied by owner and ingested as ongoing agent training.",
    capturedFrom: "Pasted creative process report, July 18, 2026",
    summary:
      "Reframes Rotary creative decisions around post format rather than platform, with routing rules for Reels, Carousels, Static Feed Posts, Stories, and Live Video plus safe-zone and aspect-ratio guidance.",
    extractedText:
      "The Rotary Creative Process categorizes content by post format before platform. Reels are reach-first short-form video with strong motion, a human or action hook in the first three seconds, completion/loop/share signals, and 9:16 vertical framing. Carousels are engagement and save-first educational assets, especially for sequential, before-and-after, data, or step-by-step content; use 5 to 7 consistent 4:5 slides, a strong first-slide hook, bite-sized information, swipe logic, and early CTA. Static Feed Posts fit high-clarity announcements, milestone updates, partnership recognition, merchandise launches, and single high-contrast event graphics; use 4:5 portrait format and avoid repetitive low-context flyers. Stories fit urgent reminders, deadline or countdown alerts, casual behind-the-scenes updates, and interactive mobile actions; use short 9:16 frames, polls, questions, sliders, countdowns, and link stickers while keeping key text/faces away from the top 15 percent and bottom 20 percent. Live Video fits real-time interactive broadcasts, panels, event updates, and Q&A. Technical standards: Reels and Stories should be 1080 x 1920; Feed Posts and Carousels should be 1080 x 1350; landscape crops should be avoided because they reduce scroll-stopping space. Social should feed an integrated journey: Reels and Live Video for discovery, Carousels and Stories for consideration and education, Static Posts and landing pages for high-intent conversion, and email for longer-term donor relationships.",
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
