import { NextResponse } from "next/server";

export const runtime = "nodejs";

type VisionRequest = {
  filename?: string;
  postType?: string;
  assetKind?: "image" | "video";
  frameDataUrls?: string[];
  browserSummary?: string;
};

type VisionJson = {
  detectedText: string;
  visualSummary: string;
  detectedSubjects: string[];
  copyAngles: string[];
  hookIdeas: string[];
  confidence: number;
};

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map(sanitizePublicLanguage)
        .slice(0, 6)
    : [];
}

function sanitizePublicLanguage(value: string) {
  return value
    .replace(/\bStickHorse\b/g, "Stick Horse")
    .replace(/\bStickhorse\b/g, "Stick Horse")
    .replace(/[—–]/g, ",")
    .replace(/\bfair\b/gi, "event")
    .trim();
}

function normalizeVisionJson(value: unknown): VisionJson {
  const record =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};
  const confidence =
    typeof record.confidence === "number"
      ? Math.max(0, Math.min(1, record.confidence))
      : 0.7;

  return {
    detectedText:
      typeof record.detectedText === "string"
        ? sanitizePublicLanguage(record.detectedText)
        : "",
    visualSummary:
      typeof record.visualSummary === "string"
        ? sanitizePublicLanguage(record.visualSummary)
        : "",
    detectedSubjects: asStringArray(record.detectedSubjects),
    copyAngles: asStringArray(record.copyAngles),
    hookIdeas: asStringArray(record.hookIdeas).slice(0, 4),
    confidence,
  };
}

function extractOutputText(payload: unknown) {
  const record =
    typeof payload === "object" && payload !== null
      ? (payload as Record<string, unknown>)
      : {};

  if (typeof record.output_text === "string") return record.output_text;

  const output = Array.isArray(record.output) ? record.output : [];
  return output
    .flatMap((item) => {
      const itemRecord =
        typeof item === "object" && item !== null
          ? (item as Record<string, unknown>)
          : {};
      const content = Array.isArray(itemRecord.content)
        ? itemRecord.content
        : [];

      return content.flatMap((contentItem) => {
        const contentRecord =
          typeof contentItem === "object" && contentItem !== null
            ? (contentItem as Record<string, unknown>)
            : {};

        return typeof contentRecord.text === "string"
          ? [contentRecord.text]
          : [];
      });
    })
    .join("\n");
}

function parseJsonOnly(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI vision response did not include JSON.");
    return JSON.parse(jsonMatch[0]);
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as VisionRequest;
  const frameDataUrls = (body.frameDataUrls ?? [])
    .filter((item) => /^data:image\/(png|jpeg|jpg|webp);base64,/i.test(item))
    .slice(0, 5);

  if (frameDataUrls.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        configured: Boolean(process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY),
        analysisWarnings: ["No sampled creative frames were available for AI vision."],
      },
      { status: 400 },
    );
  }

  const apiKey = process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY;
  const model = process.env.AI_MODEL_VISION ?? "gpt-5-mini";

  if (!apiKey) {
    return NextResponse.json({
      ok: false,
      configured: false,
      model,
      analysisWarnings: [
        "AI_API_KEY or OPENAI_API_KEY is not configured; using browser frame sampling only.",
      ],
    });
  }

  const instructions = [
    "You are analyzing Rotary Club of Dripping Springs marketing creative for stronger nonprofit social copy.",
    "Return compact JSON only with keys: detectedText, visualSummary, detectedSubjects, copyAngles, hookIdeas, confidence.",
    "Do not write finished post copy. Hook ideas must be public-facing first lines, not analysis notes.",
    "Avoid internal phrases like creative context, sampled frames, average brightness, metadata, or use this with.",
    "Style rules: Stick Horse is two words. Do not use em dashes or long dashes. Do not call this a fair. Prefer event, community event, family event, event day, or western-themed community event over describing it as a rodeo unless using the official event name.",
    "Prefer specific, engaging hooks based on what is visibly happening in the creative.",
  ].join(" ");

  const context = [
    `Filename: ${body.filename ?? "unknown"}`,
    `Asset kind: ${body.assetKind ?? "unknown"}`,
    `Recommended post type: ${body.postType ?? "Post"}`,
    `Browser summary: ${body.browserSummary ?? "none"}`,
  ].join("\n");

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: instructions },
              { type: "input_text", text: context },
              ...frameDataUrls.map((imageUrl) => ({
                type: "input_image",
                image_url: imageUrl,
                detail: "low",
              })),
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`OpenAI vision request failed with ${response.status}: ${message.slice(0, 160)}`);
    }

    const payload = await response.json();
    const outputText = extractOutputText(payload);
    const parsed = normalizeVisionJson(parseJsonOnly(outputText));

    return NextResponse.json({
      ok: true,
      configured: true,
      model,
      ...parsed,
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      configured: true,
      model,
      visualSummary: body.browserSummary ?? "",
      detectedSubjects: [],
      copyAngles: [],
      hookIdeas: [],
      confidence: 0.55,
      analysisWarnings: [
        error instanceof Error
          ? error.message
          : "AI vision analysis failed; using browser frame sampling only.",
      ],
    });
  }
}
