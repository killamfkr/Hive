import Link from "next/link";
import { auth } from "@/auth";
import { getServerEnv, stripeConfigured } from "@/lib/env";
import { CheckoutButton } from "./checkout-button";

export default async function MembershipPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const session = await auth();
  const env = getServerEnv();
  const billingReady = stripeConfigured(env);
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-white">Membership</h1>
      <p className="mt-2 text-zinc-400">
        Free members can use public boards. Pro is a monthly subscription that unlocks the IPTV Pro
        board and triggers XUI line creation (and renewal) when your panel API is configured.
      </p>

      {params.checkout === "cancel" && (
        <p className="mt-6 rounded-lg border border-zinc-700 bg-zinc-900/50 px-4 py-3 text-zinc-300">
          Checkout was canceled. You can try again anytime.
        </p>
      )}

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-xl font-semibold text-white">Free</h2>
          <p className="mt-2 text-sm text-zinc-400">
            General tech, servers, and public IPTV discussion. Register and post in open categories.
          </p>
          <ul className="mt-4 list-inside list-disc text-sm text-zinc-500">
            <li>Browse and post on public boards</li>
            <li>No billing</li>
          </ul>
          {!session?.user && (
            <Link
              href="/register"
              className="mt-6 inline-block rounded-md border border-zinc-600 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Create free account
            </Link>
          )}
        </div>

        <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-6">
          <h2 className="text-xl font-semibold text-amber-100">Pro</h2>
          <p className="mt-2 text-sm text-amber-200/80">
            Monthly via Stripe. After payment, the app calls your XUI Admin API to create a new line
            once, then extends it on each subscription renewal (invoice paid).
          </p>
          <ul className="mt-4 list-inside list-disc text-sm text-amber-200/70">
            <li>IPTV Pro members-only board</li>
            <li>XUI line provision + renew (when configured)</li>
          </ul>
          {!session?.user && (
            <p className="mt-6 text-sm text-zinc-500">
              <Link href="/login" className="text-emerald-400 hover:underline">
                Sign in
              </Link>{" "}
              to subscribe.
            </p>
          )}
          {session?.user && (
            <div className="mt-6">
              {billingReady ? (
                <CheckoutButton />
              ) : (
                <p className="text-sm text-zinc-500">
                  Stripe is not configured. Set STRIPE_SECRET_KEY, STRIPE_PRICE_ID_PAID, and
                  STRIPE_WEBHOOK_SECRET in your environment.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <section className="mt-12 rounded-lg border border-zinc-800 bg-zinc-900/30 p-6">
        <h3 className="font-semibold text-white">XUI setup</h3>
        <p className="mt-2 text-sm text-zinc-400">
          In XUI.one: enable an Admin API access code, then set{" "}
          <code className="rounded bg-zinc-800 px-1 text-zinc-200">XUI_BASE_URL</code> (full URL to{" "}
          <code className="rounded bg-zinc-800 px-1">/accesscode</code>) and{" "}
          <code className="rounded bg-zinc-800 px-1">XUI_API_KEY</code>. Use{" "}
          <code className="rounded bg-zinc-800 px-1">XUI_BOUQUET_IDS</code> for bouquet IDs. If{" "}
          <code className="rounded bg-zinc-800 px-1">create_line</code> or{" "}
          <code className="rounded bg-zinc-800 px-1">edit_line</code> parameters differ on your build,
          adjust <code className="rounded bg-zinc-800 px-1">src/lib/xui.ts</code>.
        </p>
      </section>
    </div>
  );
}
