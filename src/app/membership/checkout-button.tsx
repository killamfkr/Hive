"use client";

import { useState } from "react";

export function CheckoutButton() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div>
      {err && (
        <p className="mb-3 text-sm text-red-300">{err}</p>
      )}
      <button
        type="button"
        disabled={loading}
        onClick={async () => {
          setErr(null);
          setLoading(true);
          try {
            const res = await fetch("/api/checkout", { method: "POST" });
            const data = (await res.json()) as { url?: string; error?: string };
            if (!res.ok) {
              setErr(data.error ?? "Checkout failed");
              return;
            }
            if (data.url) window.location.href = data.url;
            else setErr("No checkout URL returned");
          } catch {
            setErr("Network error");
          } finally {
            setLoading(false);
          }
        }}
        className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400 disabled:opacity-60"
      >
        {loading ? "Redirecting…" : "Subscribe with Stripe"}
      </button>
    </div>
  );
}
