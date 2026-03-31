"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createPost } from "@/app/actions/forum";

export function ReplyForm({ threadId }: { threadId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mt-4 space-y-3"
      action={(fd) => {
        setError(null);
        startTransition(async () => {
          const r = await createPost(threadId, fd);
          if (r?.error) {
            setError(r.error);
            return;
          }
          router.refresh();
        });
      }}
    >
      {error && (
        <p className="rounded-md border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}
      <textarea
        name="content"
        required
        rows={5}
        placeholder="Your reply…"
        className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
      >
        {pending ? "Posting…" : "Post reply"}
      </button>
    </form>
  );
}
