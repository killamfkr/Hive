import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    {
      slug: "general-tech",
      name: "General tech",
      description: "Hardware, software, and everyday tooling.",
      sortOrder: 0,
      requiresPaid: false,
    },
    {
      slug: "servers-infra",
      name: "Servers & infrastructure",
      description: "Hosting, networking, Docker, Kubernetes, and homelabs.",
      sortOrder: 1,
      requiresPaid: false,
    },
    {
      slug: "iptv-streaming",
      name: "IPTV & streaming",
      description: "Playback apps, sources, and delivery — stay within the law in your region.",
      sortOrder: 2,
      requiresPaid: false,
    },
    {
      slug: "iptv-pro",
      name: "IPTV pro (members)",
      description: "Deeper panel and workflow discussion for paid members.",
      sortOrder: 3,
      requiresPaid: true,
    },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      create: c,
      update: {
        name: c.name,
        description: c.description,
        sortOrder: c.sortOrder,
        requiresPaid: c.requiresPaid,
      },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
