"use client";

import {
  AlertTriangle,
  BookOpenText,
  Check,
  ChevronDown,
  FileImage,
  FileVideo,
  Info,
  RotateCcw,
  Save,
  Upload,
} from "lucide-react";
import { useMemo, useState } from "react";
import { finalizeCopy } from "@/app/actions";
import { generatePlatformDrafts } from "@/lib/copy-generator";
import { parseCreativeFilename } from "@/lib/filename-parser";
import { suitablePostType } from "@/lib/post-type";
import type { LearningRecordView } from "@/lib/workspace-repository";
import {
  campaigns,
  draftFacts,
  trainingSources,
  type Campaign,
} from "@/lib/rotary-data";

const initialCampaign = campaigns[0];

type CreativeAnalysisState = {
  status: "idle" | "analyzing" | "completed" | "failed";
  detectedText: string;
  visualSummary: string;
  detectedSubjects: string[];
  confidence: number;
  framesAnalyzed: number;
  analysisWarnings: string[];
};

const emptyCreativeAnalysis: CreativeAnalysisState = {
  status: "idle",
  detectedText: "",
  visualSummary: "",
  detectedSubjects: [],
  confidence: 0,
  framesAnalyzed: 0,
  analysisWarnings: [],
};

function visualOrientation(width: number, height: number) {
  if (!width || !height) return "unknown orientation";
  if (height > width * 1.4) return "vertical";
  if (width > height * 1.4) return "landscape";
  return "square or near-square";
}

function analyzeCanvas(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  if (!context) return { brightness: 0, contrast: 0 };

  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  const values: number[] = [];
  const stride = Math.max(4, Math.floor(data.length / 1200 / 4) * 4);

  for (let index = 0; index < data.length; index += stride) {
    values.push((data[index] + data[index + 1] + data[index + 2]) / 3);
  }

  const brightness =
    values.reduce((total, value) => total + value, 0) / values.length;
  const contrast =
    values.reduce((total, value) => total + Math.abs(value - brightness), 0) /
    values.length;

  return {
    brightness: Math.round(brightness),
    contrast: Math.round(contrast),
  };
}

function canvasFor(width: number, height: number) {
  const canvas = document.createElement("canvas");
  const maxWidth = 320;
  const scale = Math.min(1, maxWidth / Math.max(width, 1));
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  return canvas;
}

async function analyzeImage(url: string): Promise<CreativeAnalysisState> {
  const image = new Image();
  image.src = url;
  await image.decode();

  const canvas = canvasFor(image.naturalWidth, image.naturalHeight);
  canvas
    .getContext("2d")
    ?.drawImage(image, 0, 0, canvas.width, canvas.height);
  const { brightness, contrast } = analyzeCanvas(canvas);
  const orientation = visualOrientation(image.naturalWidth, image.naturalHeight);
  const warnings =
    orientation === "landscape"
      ? ["Landscape images use less vertical feed space than 4:5 creative."]
      : [];

  return {
    status: "completed",
    detectedText: "",
    visualSummary: `Single ${orientation} image, ${image.naturalWidth}x${image.naturalHeight}, sampled brightness ${brightness}, contrast ${contrast}.`,
    detectedSubjects: [orientation, "single image"],
    confidence: 0.55,
    framesAnalyzed: 1,
    analysisWarnings: warnings,
  };
}

function waitForVideoEvent(video: HTMLVideoElement, eventName: string) {
  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      video.removeEventListener(eventName, handleEvent);
      video.removeEventListener("error", handleError);
    };
    const handleEvent = () => {
      cleanup();
      resolve();
    };
    const handleError = () => {
      cleanup();
      reject(new Error("Video analysis failed."));
    };
    video.addEventListener(eventName, handleEvent, { once: true });
    video.addEventListener("error", handleError, { once: true });
  });
}

async function analyzeVideo(url: string): Promise<CreativeAnalysisState> {
  const video = document.createElement("video");
  video.src = url;
  video.muted = true;
  video.preload = "metadata";
  video.playsInline = true;
  await waitForVideoEvent(video, "loadedmetadata");

  const duration = Number.isFinite(video.duration) ? video.duration : 0;
  const sampleTimes =
    duration > 0
      ? [0.1, duration * 0.25, duration * 0.5, duration * 0.75, Math.max(0.1, duration - 0.1)]
      : [0];
  const uniqueSampleTimes = Array.from(
    new Set(sampleTimes.map((time) => Number(time.toFixed(2)))),
  );
  const canvas = canvasFor(video.videoWidth, video.videoHeight);
  const context = canvas.getContext("2d");
  const samples: Array<{ brightness: number; contrast: number }> = [];

  for (const time of uniqueSampleTimes) {
    video.currentTime = Math.min(time, Math.max(0, duration - 0.05));
    await waitForVideoEvent(video, "seeked");
    context?.drawImage(video, 0, 0, canvas.width, canvas.height);
    samples.push(analyzeCanvas(canvas));
  }

  const avgBrightness = Math.round(
    samples.reduce((total, sample) => total + sample.brightness, 0) /
      samples.length,
  );
  const avgContrast = Math.round(
    samples.reduce((total, sample) => total + sample.contrast, 0) /
      samples.length,
  );
  const orientation = visualOrientation(video.videoWidth, video.videoHeight);
  const warnings = [
    duration > 60
      ? "Video is longer than 60 seconds; Reel copy should assume a shorter edited cut."
      : "",
    orientation !== "vertical"
      ? "Video is not vertical 9:16; Reels and Stories usually need vertical framing."
      : "",
  ].filter(Boolean);

  return {
    status: "completed",
    detectedText: "",
    visualSummary: `${orientation} video, ${video.videoWidth}x${video.videoHeight}, ${duration.toFixed(1)} seconds, sampled ${samples.length} representative frames, average brightness ${avgBrightness}, average contrast ${avgContrast}.`,
    detectedSubjects: [orientation, "video", `${samples.length} sampled frames`],
    confidence: 0.6,
    framesAnalyzed: samples.length,
    analysisWarnings: warnings,
  };
}

async function analyzeCreativeFile(
  file: File,
  url: string,
  assetKind: "image" | "video",
): Promise<CreativeAnalysisState> {
  try {
    return assetKind === "video" ? await analyzeVideo(url) : await analyzeImage(url);
  } catch (error) {
    return {
      ...emptyCreativeAnalysis,
      status: "failed",
      analysisWarnings: [
        error instanceof Error ? error.message : "Creative analysis failed.",
      ],
    };
  }
}

function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "warning" | "danger" | "blue";
}) {
  const tones = {
    neutral: "border-stone-200 bg-white text-stone-700",
    good: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    danger: "border-red-200 bg-red-50 text-red-800",
    blue: "border-sky-200 bg-sky-50 text-sky-900",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function PostTypeCopyApproval({
  postType,
  suggestedCopy,
  revisedCopy,
  onRevisedCopyChange,
}: {
  postType: string;
  suggestedCopy: string;
  revisedCopy: string;
  onRevisedCopyChange: (value: string) => void;
}) {
  const hasEditableDraft = revisedCopy.trim().length > 0;
  const hasOwnerRevision =
    hasEditableDraft && revisedCopy.trim() !== suggestedCopy.trim();

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-stone-950">
            {postType} Copy
          </h3>
          <p className="text-xs text-stone-500">
            Suggested copy with editable approved copy underneath
          </p>
        </div>
        <Badge tone={hasOwnerRevision ? "blue" : hasEditableDraft ? "good" : "neutral"}>
          {hasOwnerRevision
            ? "Owner revised"
            : hasEditableDraft
              ? "Ready to edit"
              : "Suggested"}
        </Badge>
      </div>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          {postType} Suggested Copy
        </span>
        <textarea
          className="mt-2 min-h-40 w-full resize-y rounded-md border border-stone-300 bg-stone-50 p-3 text-sm leading-6 text-stone-700 outline-none"
          value={suggestedCopy}
          readOnly
          placeholder={`Generate copy to see the ${postType} suggestion here.`}
        />
      </label>

      <label className="mt-4 block">
        <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          {postType} Revised -&gt; Approved Copy
        </span>
        <textarea
          className="mt-2 min-h-48 w-full resize-y rounded-md border border-stone-300 bg-white p-3 text-sm leading-6 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          value={revisedCopy}
          onChange={(event) => onRevisedCopyChange(event.target.value)}
          placeholder={`Generate copy to create an editable ${postType} approval draft.`}
        />
      </label>
    </section>
  );
}

export function MarketingManager({
  initialRecords,
}: {
  initialRecords: LearningRecordView[];
}) {
  const [campaign] = useState<Campaign>(initialCampaign);
  const [filename, setFilename] = useState(
    "Rodeo_SponsorRecruitment_StickHorseShowdown_SignUp_v1.png",
  );
  const [assetUrl, setAssetUrl] = useState<string | null>(null);
  const [assetKind, setAssetKind] = useState<"image" | "video" | "none">(
    "none",
  );
  const [assetMeta, setAssetMeta] = useState({ mimeType: "", fileSize: 0 });
  const [creativeAnalysis, setCreativeAnalysis] =
    useState<CreativeAnalysisState>(emptyCreativeAnalysis);
  const [hasUploadedCreative, setHasUploadedCreative] = useState(false);
  const [suggestedCopy, setSuggestedCopy] = useState("");
  const [revisedCopy, setRevisedCopy] = useState("");
  const [editReason, setEditReason] = useState("");
  const [records, setRecords] = useState<LearningRecordView[]>(initialRecords);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const parseResult = useMemo(
    () => parseCreativeFilename(filename, campaign.name),
    [filename, campaign.name],
  );

  const parsedContentType = parseResult.contentType ?? "Unconfirmed content type";
  const postType = suitablePostType(assetKind, filename, parseResult);

  function generateCopyForContext(
    nextFilename: string,
    nextAssetKind = assetKind,
    analysisSummary = creativeAnalysis.visualSummary,
  ) {
    const nextParseResult = parseCreativeFilename(nextFilename, campaign.name);
    const nextPostType = suitablePostType(
      nextAssetKind,
      nextFilename,
      nextParseResult,
    );
    const drafts = generatePlatformDrafts(
      campaign,
      nextParseResult,
      nextParseResult.contentType ?? "Unconfirmed content type",
      nextPostType,
      analysisSummary,
    );
    const sharedPostTypeDraft = drafts.facebook;
    setSuggestedCopy(sharedPostTypeDraft);
    setRevisedCopy(sharedPostTypeDraft);
    setEditReason("");
  }

  async function handleFinalize() {
    if (!suggestedCopy.trim()) {
      return;
    }

    setSaveStatus("saving");

    try {
      const result = await finalizeCopy({
        campaignSlug: campaign.slug,
        filename,
        contentType: parsedContentType,
        subject: parseResult.subject ?? "Unconfirmed subject",
        assetPurpose: parseResult.assetPurpose ?? "Unconfirmed purpose",
        postType,
        assetType: assetKind === "video" ? "video" : "image",
        mimeType: assetMeta.mimeType,
        fileSize: assetMeta.fileSize,
        creativeAnalysis: {
          detectedText: creativeAnalysis.detectedText,
          visualSummary: creativeAnalysis.visualSummary,
          detectedSubjects: creativeAnalysis.detectedSubjects,
          confidence: creativeAnalysis.confidence,
          framesAnalyzed: creativeAnalysis.framesAnalyzed,
          analysisWarnings: creativeAnalysis.analysisWarnings,
        },
        filenameParseStatus: parseResult.status,
        filenameParseWarnings: parseResult.warnings,
        facebookSuggestedCopy: suggestedCopy,
        facebookApprovedCopy: revisedCopy,
        instagramSuggestedCopy: suggestedCopy,
        instagramApprovedCopy: revisedCopy,
        editReason,
      });

      setRecords(result.records);
      setSaveStatus(result.ok ? "saved" : "error");
    } catch {
      setSaveStatus("error");
    }
  }

  async function handleFileUpload(file: File | undefined) {
    if (!file) return;
    const nextAssetKind = file.type.startsWith("video") ? "video" : "image";
    const nextAssetUrl = URL.createObjectURL(file);
    setFilename(file.name);
    setAssetKind(nextAssetKind);
    setAssetMeta({ mimeType: file.type, fileSize: file.size });
    setAssetUrl(nextAssetUrl);
    setHasUploadedCreative(true);
    setCreativeAnalysis({ ...emptyCreativeAnalysis, status: "analyzing" });

    const nextAnalysis = await analyzeCreativeFile(
      file,
      nextAssetUrl,
      nextAssetKind,
    );
    setCreativeAnalysis(nextAnalysis);
    generateCopyForContext(
      file.name,
      nextAssetKind,
      nextAnalysis.visualSummary,
    );
  }

  function handleFilenameChange(value: string) {
    setFilename(value);
    if (hasUploadedCreative) {
      generateCopyForContext(value);
    }
  }

  function resetDrafts() {
    setSuggestedCopy("");
    setRevisedCopy("");
    setEditReason("");
    setCreativeAnalysis(emptyCreativeAnalysis);
    setAssetMeta({ mimeType: "", fileSize: 0 });
    setHasUploadedCreative(false);
  }

  const parseTone =
    parseResult.status === "matched"
      ? "good"
      : parseResult.status === "partial"
        ? "warning"
        : "danger";
  const pendingFacts = draftFacts(campaign);

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-stone-950">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-full bg-[#17458f] text-sm font-bold text-white">
                R
              </div>
              <Badge tone="blue">Owner only</Badge>
              <Badge tone="neutral">Standalone Phase 1</Badge>
            </div>
            <h1 className="text-2xl font-semibold tracking-normal text-stone-950 md:text-3xl">
              Rotary Marketing Manager
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-stone-600">
              Campaign-based copy workspace for Rotary Club of Dripping Springs.
              This build is isolated from CHRE, Custom Walkout Song, and the
              Rotary Outreach App.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm font-medium text-stone-800 transition hover:bg-stone-50"
              title="Reset generated drafts"
              onClick={resetDrafts}
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 px-5 py-5 lg:grid-cols-[290px_1fr]">
        <aside className="space-y-4">
          <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <label className="text-xs font-medium uppercase tracking-wide text-stone-500">
              Current campaign
            </label>
            <button className="mt-2 flex w-full items-center justify-between rounded-md border border-stone-300 bg-white px-3 py-2 text-left text-sm font-semibold text-stone-900">
              {campaign.name}
              <ChevronDown size={16} />
            </button>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              {campaign.shortDescription}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="good">Active</Badge>
              <Badge tone="good">Knowledge current</Badge>
            </div>
          </section>

          {pendingFacts.length > 0 ? (
            <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-600" />
                <h2 className="text-sm font-semibold">Needs Approval</h2>
              </div>
              <div className="space-y-2">
                {pendingFacts.map((fact) => (
                  <div
                    key={fact.id}
                    className="rounded-md border border-amber-200 bg-amber-50 p-3"
                  >
                    <p className="text-xs font-semibold text-amber-950">
                      {fact.label}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-amber-900">
                      {fact.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <BookOpenText size={16} className="text-[#17458f]" />
              <h2 className="text-sm font-semibold">Training Sources</h2>
            </div>
            <div className="space-y-3">
              {trainingSources
                .filter((source) => source.campaignSlug === campaign.slug)
                .map((source) => (
                  <div
                    key={source.id}
                    className="rounded-md border border-sky-200 bg-sky-50 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-sky-950">
                          {source.title}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-sky-900">
                          {source.accessNote}
                        </p>
                      </div>
                      <Badge tone={source.status === "ingested" ? "good" : "blue"}>
                        {source.status === "ingested" ? "Ingested" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        </aside>

        <div className="space-y-5">
          <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
              <div>
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Creative Upload and Context
                    </h2>
                    <p className="mt-1 text-sm text-stone-600">
                      The agent reads whatever filename is uploaded and makes
                      the strongest draft it can from the available context.
                    </p>
                  </div>
                  <Badge tone={parseTone}>
                    {parseResult.status === "matched"
                      ? "Filename matched"
                      : parseResult.status === "partial"
                        ? "Best effort"
                        : "Needs more context"}
                  </Badge>
                </div>
                <div className="mb-4 flex flex-wrap gap-2">
                  <Badge tone="blue">Recommended: {postType}</Badge>
                  {assetKind === "image" ? (
                    <Badge tone="neutral">Reel copy hidden for static creative</Badge>
                  ) : null}
                </div>

                <div className="grid gap-4">
                  <label className="block">
                    <span className="text-xs font-medium text-stone-600">
                      Filename
                    </span>
                    <input
                      className="mt-1 h-11 w-full rounded-md border border-stone-300 px-3 text-sm text-stone-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                      value={filename}
                      onChange={(event) =>
                        handleFilenameChange(event.target.value)
                      }
                    />
                  </label>
                </div>

                {parseResult.warnings.length > 0 ? (
                  <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-950">
                      <Info size={16} />
                      Filename context
                    </div>
                    <ul className="space-y-1 text-sm text-amber-900">
                      {parseResult.warnings.map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="mt-4 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                    <Check size={16} />
                    Filename context is ready for generation.
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 p-4">
                <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-md bg-white p-4 text-center transition hover:bg-stone-50">
                  {assetUrl && assetKind === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={assetUrl}
                      alt="Uploaded creative preview"
                      className="max-h-48 rounded-md object-contain"
                    />
                  ) : assetUrl && assetKind === "video" ? (
                    <video
                      src={assetUrl}
                      className="max-h-48 rounded-md"
                      controls
                    />
                  ) : (
                    <>
                      <Upload size={30} className="text-[#17458f]" />
                      <span className="mt-3 text-sm font-semibold">
                        Upload image or video
                      </span>
                      <span className="mt-1 text-xs text-stone-500">
                        Preview is local in this Phase 1 build
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="sr-only"
                    onChange={(event) =>
                      void handleFileUpload(event.target.files?.[0])
                    }
                  />
                </label>
                <div className="mt-3 rounded-md border border-stone-200 bg-white p-3 text-xs text-stone-600">
                  <div className="flex items-center gap-2 font-semibold text-stone-800">
                    {assetKind === "video" ? (
                      <FileVideo size={15} />
                    ) : (
                      <FileImage size={15} />
                    )}
                    Creative analysis
                  </div>
                  {creativeAnalysis.status === "analyzing" ? (
                    <p className="mt-2 leading-5">Analyzing uploaded creative...</p>
                  ) : creativeAnalysis.visualSummary ? (
                    <div className="mt-2 space-y-2 leading-5">
                      <p>{creativeAnalysis.visualSummary}</p>
                      <p>
                        Frames analyzed: {creativeAnalysis.framesAnalyzed}
                        {" | "}
                        Confidence: {Math.round(creativeAnalysis.confidence * 100)}%
                      </p>
                      {creativeAnalysis.analysisWarnings.length > 0 ? (
                        <ul className="space-y-1 text-amber-800">
                          {creativeAnalysis.analysisWarnings.map((warning) => (
                            <li key={warning}>{warning}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ) : creativeAnalysis.status === "failed" ? (
                    <p className="mt-2 leading-5 text-amber-800">
                      Analysis could not be completed, so copy will use filename
                      and campaign knowledge only.
                    </p>
                  ) : (
                    <p className="mt-2 leading-5">
                      Upload a creative to analyze image dimensions or video
                      frame samples before copy is generated.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <div className="mb-4">
              <div>
                <h2 className="text-lg font-semibold">Copy Approval</h2>
                <p className="mt-1 text-sm text-stone-600">
                  Upload a creative to generate copy only for the post type the
                  asset is suited for. Static images will not receive Reel copy.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="max-w-3xl">
                <PostTypeCopyApproval
                  postType={postType}
                  suggestedCopy={suggestedCopy}
                  revisedCopy={revisedCopy}
                  onRevisedCopyChange={setRevisedCopy}
                />
              </div>

              <label className="block">
                <span className="text-xs font-medium text-stone-600">
                  Edit reason
                </span>
                <input
                  className="mt-1 h-10 w-full rounded-md border border-stone-300 px-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  placeholder="Optional during the training period"
                  value={editReason}
                  onChange={(event) => setEditReason(event.target.value)}
                />
              </label>

              <div className="flex justify-end">
                <button
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-[#f7a81b] px-4 text-sm font-semibold text-stone-950 transition hover:bg-[#e59a16] disabled:cursor-not-allowed disabled:opacity-60"
                  title="Finalize owner-approved copy"
                  onClick={handleFinalize}
                  disabled={
                    saveStatus === "saving" ||
                    !suggestedCopy.trim()
                  }
                >
                  <Save size={16} />
                  {saveStatus === "saving" ? "Saving..." : "Finalize Copy"}
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Learning Records</h2>
                <p className="mt-1 text-sm text-stone-600">
                  Finalized copy stores suggested text, revised approved text,
                  edit reason, campaign, post type, content type, subject, and
                  timestamp. Platform is retained as a delivery channel.
                </p>
              </div>
              <Badge tone={records.length ? "good" : "neutral"}>
                {records.length} stored
              </Badge>
            </div>
            {saveStatus === "saved" ? (
              <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                Finalized copy saved to the active persistence layer.
              </div>
            ) : null}
            {saveStatus === "error" ? (
              <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                The copy could not be saved. Check database environment
                variables or try again.
              </div>
            ) : null}
            {records.length === 0 ? (
              <div className="rounded-md border border-stone-200 bg-stone-50 p-5 text-sm text-stone-600">
                No finalized records yet. Upload a creative, make any edits,
                then select Finalize Copy.
              </div>
            ) : (
              <div className="overflow-hidden rounded-md border border-stone-200">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                    <tr>
                      <th className="px-3 py-2">Record</th>
                      <th className="px-3 py-2">Post type</th>
                      <th className="px-3 py-2">Subject</th>
                      <th className="px-3 py-2">Content type</th>
                      <th className="px-3 py-2">Edit reason</th>
                      <th className="px-3 py-2">Finalized</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id} className="border-t border-stone-100">
                        <td className="px-3 py-3 font-medium text-stone-900">
                          {record.platform}
                        </td>
                        <td className="px-3 py-3 text-stone-700">
                          {record.postType}
                        </td>
                        <td className="px-3 py-3 text-stone-700">
                          {record.subject}
                        </td>
                        <td className="px-3 py-3 text-stone-700">
                          {record.contentType}
                        </td>
                        <td className="px-3 py-3 text-stone-700">
                          {record.editReason || "None provided"}
                        </td>
                        <td className="px-3 py-3 text-stone-700">
                          {record.finalizedAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
