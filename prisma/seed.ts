import { PrismaClient } from "@prisma/client";
import {
  campaigns,
  contentTaxonomy,
  normalizeToken,
  trainingSources,
} from "../src/lib/rotary-data";

const prisma = new PrismaClient();

function toSlug(value: string) {
  return normalizeToken(value);
}

async function main() {
  for (const campaign of campaigns) {
    const dbCampaign = await prisma.campaign.upsert({
      where: { slug: campaign.slug },
      create: {
        name: campaign.name,
        slug: campaign.slug,
        shortDescription: campaign.shortDescription,
        status: campaign.status,
      },
      update: {
        name: campaign.name,
        shortDescription: campaign.shortDescription,
        status: campaign.status,
      },
    });

    for (const fact of campaign.facts) {
      await prisma.campaignKnowledgeFact.upsert({
        where: {
          campaignId_label: {
            campaignId: dbCampaign.id,
            label: fact.label,
          },
        },
        create: {
          campaignId: dbCampaign.id,
          category: fact.category,
          label: fact.label,
          value: fact.value,
          status: fact.status,
          stability: fact.stability,
        },
        update: {
          category: fact.category,
          value: fact.value,
          status: fact.status,
          stability: fact.stability,
        },
      });
    }

    for (const source of trainingSources.filter(
      (item) => item.campaignSlug === campaign.slug,
    )) {
      await prisma.trainingSource.upsert({
        where: { stableKey: source.id },
        create: {
          stableKey: source.id,
          campaignId: dbCampaign.id,
          title: source.title,
          sourceType: source.sourceType,
          scope: source.scope,
          status: source.status,
          sourceUrl: source.sourceUrl,
          capturedFrom: source.capturedFrom,
          accessNote: source.accessNote,
          extractedText: source.extractedText,
          summary: source.summary,
        },
        update: {
          campaignId: dbCampaign.id,
          title: source.title,
          sourceType: source.sourceType,
          scope: source.scope,
          status: source.status,
          sourceUrl: source.sourceUrl,
          capturedFrom: source.capturedFrom,
          accessNote: source.accessNote,
          extractedText: source.extractedText,
          summary: source.summary,
        },
      });
    }
  }

  for (const group of contentTaxonomy) {
    for (const item of group.items) {
      await prisma.contentType.upsert({
        where: { slug: toSlug(item) },
        create: {
          group: group.group,
          name: item,
          slug: toSlug(item),
        },
        update: {
          group: group.group,
          name: item,
          active: true,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
