import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// FR-37: seed the admin-managed controlled lists (sectors, domains, ...)
// with a starting set. Admins can add/retire values from the console.
const SEED_LISTS: Record<string, string[]> = {
  SECTOR: [
    "Fintech",
    "Healthtech",
    "Agritech",
    "SaaS",
    "EdTech",
    "E-commerce",
    "Deep Tech",
    "Climate Tech",
    "Logistics",
    "Other",
  ],
  TECH_DOMAIN: ["AI/ML", "Blockchain", "IoT", "Cloud", "Mobile", "Data & Analytics"],
  INDUSTRY_DOMAIN: ["BFSI", "Healthcare", "Retail", "Manufacturing", "Education", "Government"],
  MARKET_GEOGRAPHY: ["Kerala", "India", "GCC", "SEA", "US", "Europe"],
  PARTNERSHIP_TYPE: ["Customer intro", "Channel", "Pilot", "Mentoring"],
  HELP_TYPE: ["Capital", "Market access", "Both"],
};

async function main() {
  for (const [type, values] of Object.entries(SEED_LISTS)) {
    for (let index = 0; index < values.length; index++) {
      const value = values[index];
      await prisma.controlledList.upsert({
        where: { type_value: { type: type as never, value } },
        update: { sortOrder: index },
        create: { type: type as never, value, sortOrder: index },
      });
    }
  }
  console.log("Seeded controlled lists.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
