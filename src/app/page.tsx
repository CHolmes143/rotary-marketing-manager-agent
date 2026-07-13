import { MarketingManager } from "@/components/marketing-manager";
import { getLearningRecords } from "@/lib/workspace-repository";

export default async function Home() {
  const records = await getLearningRecords();

  return <MarketingManager initialRecords={records} />;
}
