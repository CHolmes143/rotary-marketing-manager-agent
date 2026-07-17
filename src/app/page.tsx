import { MarketingManager } from "@/components/marketing-manager";
import { getLearningRecords } from "@/lib/workspace-repository";

export const dynamic = "force-dynamic";

export default async function Home() {
  const records = await getLearningRecords();

  return <MarketingManager initialRecords={records} />;
}
