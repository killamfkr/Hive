import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ReplyForm } from "./reply-form";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const thread = await prisma.thread.findUnique({
    where: { id },
    include: {
      category: true,
      author: { select: { name: true, email: true } },
      posts: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { name: true, email: true } } },
      },
    },
  });
  if (!thread) notFound();

  const user = session?.user?.id
    ? await prisma.user.findUnique({ where: { id: session.user.id } })
    : null;
  const canRead =
    !thread.category.requiresPaid || user?.membershipTier === "PAID";
  const canReply =
    user && (!thread.category.requiresPaid || user.membershipTier === "PAID");

  if (!canRead) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="rounded-lg border border-amber-900/50 bg-amber-950/30 px-4 py-3 text-amber-100">
          Pro membership is required to view this thread.{" "}
          <Link href="/membership" className="underline">
            Membership
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href={`/forum/${thread.category.slug}`}
        className="text-sm text-zinc-500 hover:text-zinc-300"
      >
        ← {thread.category.name}
      </Link>
      <h1 className="mt-2 text-3xl font-bold text-white">{thread.title}</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Started by {thread.author.name ?? thread.author.email} ·{" "}
        {thread.createdAt.toLocaleString()}
      </p>

      <ol className="mt-8 space-y-6">
        {thread.posts.map((p) => (
          <li
            key={p.id}
            className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
          >
            <p className="text-xs text-zinc-500">
              {p.author.name ?? p.author.email} · {p.createdAt.toLocaleString()}
            </p>
            <div className="mt-2 whitespace-pre-wrap text-zinc-200">{p.content}</div>
          </li>
        ))}
      </ol>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-white">Reply</h2>
        {!user && (
          <p className="mt-2 text-sm text-zinc-500">
            <Link href="/login" className="text-emerald-400 hover:underline">
              Sign in
            </Link>{" "}
            to reply.
          </p>
        )}
        {user && !canReply && (
          <p className="mt-2 text-sm text-amber-200">
            Upgrade to Pro to post in this category.
          </p>
        )}
        {user && canReply && <ReplyForm threadId={thread.id} />}
      </section>
    </div>
  );
}
