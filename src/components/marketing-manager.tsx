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
import type { LearningRecordView } from "@/lib/workspace-repository";
import {
  campaigns,
  draftFacts,
  trainingSources,
  type Campaign,
} from "@/lib/rotary-data";

const initialCampaign = campaigns[0];

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

function PlatformCopyApproval({
  platform,
  suggestedCopy,
  revisedCopy,
  onRevisedCopyChange,
}: {
  platform: "Facebook" | "Instagram";
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
          <h3 className="text-sm font-semibold text-stone-950">{platform}</h3>
          <p className="text-xs text-stone-500">
            Suggested copy with revised approved copy underneath
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
          {platform} Suggested Copy
        </span>
        <textarea
          className="mt-2 min-h-40 w-full resize-y rounded-md border border-stone-300 bg-stone-50 p-3 text-sm leading-6 text-stone-700 outline-none"
          value={suggestedCopy}
          readOnly
          placeholder={`Generate copy to see the ${platform} suggestion here.`}
        />
      </label>

      <label className="mt-4 block">
        <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          {platform} Revised -&gt; Approved Copy
        </span>
        <textarea
          className="mt-2 min-h-48 w-full resize-y rounded-md border border-stone-300 bg-white p-3 text-sm leading-6 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          value={revisedCopy}
          onChange={(event) => onRevisedCopyChange(event.target.value)}
          placeholder={`Generate copy to create an editable ${platform} approval draft.`}
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
  const [hasUploadedCreative, setHasUploadedCreative] = useState(false);
  const [facebookSuggestedCopy, setFacebookSuggestedCopy] = useState("");
  const [facebookRevisedCopy, setFacebookRevisedCopy] = useState("");
  const [instagramSuggestedCopy, setInstagramSuggestedCopy] = useState("");
  const [instagramRevisedCopy, setInstagramRevisedCopy] = useState("");
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

  function generateCopyForContext(nextFilename: string) {
    const nextParseResult = parseCreativeFilename(nextFilename, campaign.name);
    const drafts = generatePlatformDrafts(
      campaign,
      nextParseResult,
      nextParseResult.contentType ?? "Unconfirmed content type",
    );
    setFacebookSuggestedCopy(drafts.facebook);
    setInstagramSuggestedCopy(drafts.instagram);
    setFacebookRevisedCopy(drafts.facebook);
    setInstagramRevisedCopy(drafts.instagram);
    setEditReason("");
  }

  async function handleFinalize() {
    if (!facebookSuggestedCopy.trim() || !instagramSuggestedCopy.trim()) {
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
        filenameParseStatus: parseResult.status,
        filenameParseWarnings: parseResult.warnings,
        facebookSuggestedCopy,
        facebookApprovedCopy: facebookRevisedCopy,
        instagramSuggestedCopy,
        instagramApprovedCopy: instagramRevisedCopy,
        editReason,
      });

      setRecords(result.records);
      setSaveStatus(result.ok ? "saved" : "error");
    } catch {
      setSaveStatus("error");
    }
  }

  function handleFileUpload(file: File | undefined) {
    if (!file) return;
    setFilename(file.name);
    setAssetKind(file.type.startsWith("video") ? "video" : "image");
    setAssetUrl(URL.createObjectURL(file));
    setHasUploadedCreative(true);
    generateCopyForContext(file.name);
  }

  function handleFilenameChange(value: string) {
    setFilename(value);
    if (hasUploadedCreative) {
      generateCopyForContext(value);
    }
  }

  function resetDrafts() {
    setFacebookSuggestedCopy("");
    setFacebookRevisedCopy("");
    setInstagramSuggestedCopy("");
    setInstagramRevisedCopy("");
    setEditReason("");
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
                      handleFileUpload(event.target.files?.[0])
                    }
                  />
                </label>
                <div className="mt-3 flex items-center gap-2 text-xs text-stone-600">
                  {assetKind === "video" ? (
                    <FileVideo size={15} />
                  ) : (
                    <FileImage size={15} />
                  )}
                  Media analysis placeholder: detected text, visual summary,
                  frame count, and confidence will persist with storage.
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <div className="mb-4">
              <div>
                <h2 className="text-lg font-semibold">Copy Approval</h2>
                <p className="mt-1 text-sm text-stone-600">
                  Upload a creative to automatically generate platform-specific
                  recommendations, then revise or approve them for the learning
                  record.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 xl:grid-cols-2">
                <PlatformCopyApproval
                  platform="Facebook"
                  suggestedCopy={facebookSuggestedCopy}
                  revisedCopy={facebookRevisedCopy}
                  onRevisedCopyChange={setFacebookRevisedCopy}
                />
                <PlatformCopyApproval
                  platform="Instagram"
                  suggestedCopy={instagramSuggestedCopy}
                  revisedCopy={instagramRevisedCopy}
                  onRevisedCopyChange={setInstagramRevisedCopy}
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
                    !facebookSuggestedCopy.trim() ||
                    !instagramSuggestedCopy.trim()
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
                  Finalized copy stores platform-specific suggested text,
                  revised approved text, edit reason, campaign, content type,
                  subject, and timestamp.
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
