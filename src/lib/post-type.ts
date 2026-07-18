import type { FilenameParseResult } from "@/lib/filename-parser";

export function derivePostType(
  filename: string,
  parseResult: Pick<FilenameParseResult, "contentType" | "subject" | "assetPurpose">,
) {
  const value = [
    filename,
    parseResult.contentType,
    parseResult.subject,
    parseResult.assetPurpose,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/\breels?\b/.test(value)) return "Reel";
  if (/\bstor(?:y|ies)\b/.test(value)) return "Story";
  if (/\bcarousel\b/.test(value)) return "Carousel";
  if (/\bvideo\b/.test(value)) return "Video";

  return "Post";
}
