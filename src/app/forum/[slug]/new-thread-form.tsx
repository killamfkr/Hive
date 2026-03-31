"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createThread } from "@/app/actions/forum";

export function NewThreadForm({ categorySlug }: { categorySlug: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mt-4 space-y-3"
      action={(fd) => {
        setError(null);
        startTransition(async () => {
          const r = await createThread(fd);
          if ("error" in r && r.error) {
            setError(r.error);
            return;
          }
          if ("ok" in r && r.ok && r.threadId) {
            router.push(`/forum/thread/${r.threadId}`);
          }
        });
      }}
    >
      {error && (
        <p className="rounded-md border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}
      <input type="hidden" name="categorySlug" value={categorySlug} />
      <div>
        <label htmlFor="title" className="block text-sm text-zinc-400">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={200}
          className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
        />
      </div>
      <div>
        <label htmlFor="body" className="block text-sm text-zinc-400">
          First post
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={6}
          className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
      >
        {pending ? "Posting…" : "Create thread"}
      </button>
    </form>
  );
}
