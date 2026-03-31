import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ForumIndexPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { threads: true } },
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-white">Boards</h1>
      <p className="mt-2 text-zinc-400">
        Tech, servers, and IPTV — pick a category to browse threads.
      </p>
      <ul className="mt-8 divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-900/40">
        {categories.map((c) => (
          <li key={c.id}>
            <Link
              href={`/forum/${c.slug}`}
              className="flex flex-col gap-1 px-4 py-4 hover:bg-zinc-800/50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <span className="font-medium text-white">{c.name}</span>
                {c.requiresPaid && (
                  <span className="ml-2 rounded bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">
                    Pro
                  </span>
                )}
                {c.description && (
                  <p className="mt-1 text-sm text-zinc-500">{c.description}</p>
                )}
              </div>
              <span className="text-sm text-zinc-500">{c._count.threads} threads</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
