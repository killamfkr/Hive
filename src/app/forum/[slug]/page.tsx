import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NewThreadForm } from "./new-thread-form";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      threads: {
        orderBy: { updatedAt: "desc" },
        take: 50,
        include: { author: { select: { name: true, email: true } } },
      },
    },
  });
  if (!category) notFound();

  const user = session?.user?.id
    ? await prisma.user.findUnique({ where: { id: session.user.id } })
    : null;
  const canPost =
    user && (!category.requiresPaid || user.membershipTier === "PAID");
  const canRead = !category.requiresPaid || user?.membershipTier === "PAID";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <Link href="/forum" className="text-sm text-zinc-500 hover:text-zinc-300">
            ← All boards
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-white">
            {category.name}
            {category.requiresPaid && (
              <span className="ml-2 align-middle text-base font-normal text-amber-400">
                (Pro)
              </span>
            )}
          </h1>
        </div>
      </div>
      {category.description && (
        <p className="mt-2 text-zinc-400">{category.description}</p>
      )}

      {!canRead && (
        <p className="mt-8 rounded-lg border border-amber-900/50 bg-amber-950/30 px-4 py-3 text-amber-100">
          This board is for Pro members.{" "}
          <Link href="/membership" className="underline">
            View membership
          </Link>
          .
        </p>
      )}

      {canRead && (
        <>
          <ul className="mt-8 divide-y divide-zinc-800 rounded-lg border border-zinc-800">
            {category.threads.length === 0 ? (
              <li className="px-4 py-8 text-center text-zinc-500">No threads yet.</li>
            ) : (
              category.threads.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/forum/thread/${t.id}`}
                    className="block px-4 py-3 hover:bg-zinc-900/80"
                  >
                    <span className="font-medium text-white">{t.title}</span>
                    <span className="mt-1 block text-xs text-zinc-500">
                      {t.author.name ?? t.author.email} ·{" "}
                      {t.updatedAt.toLocaleDateString()}
                    </span>
                  </Link>
                </li>
              ))
            )}
          </ul>

          <section className="mt-12">
            <h2 className="text-lg font-semibold text-white">New thread</h2>
            {!user && (
              <p className="mt-2 text-sm text-zinc-500">
                <Link href="/login" className="text-emerald-400 hover:underline">
                  Sign in
                </Link>{" "}
                to start a thread.
              </p>
            )}
            {user && !canPost && (
              <p className="mt-2 text-sm text-amber-200">
                Pro membership required to post in this category.
              </p>
            )}
            {user && canPost && (
              <NewThreadForm categorySlug={category.slug} />
            )}
          </section>
        </>
      )}
    </div>
  );
}
