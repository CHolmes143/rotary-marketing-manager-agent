"use server";

import {
  saveFinalizedCopy,
  type FinalizeCopyInput,
} from "@/lib/workspace-repository";

export async function finalizeCopy(input: FinalizeCopyInput) {
  return saveFinalizedCopy(input);
}
