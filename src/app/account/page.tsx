import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account");
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  const params = await searchParams;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-white">Account</h1>
      <p className="mt-2 text-zinc-400">
        {user.email}
        {user.name && ` · ${user.name}`}
      </p>

      {params.checkout === "success" && (
        <p className="mt-6 rounded-lg border border-emerald-900/50 bg-emerald-950/30 px-4 py-3 text-emerald-100">
          Thanks — if payment completed, your Pro status and XUI line will update shortly via webhook.
          Refresh this page in a moment.
        </p>
      )}

      <dl className="mt-8 grid gap-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-6 text-sm">
        <div>
          <dt className="text-zinc-500">Tier</dt>
          <dd className="font-medium text-white">
            {user.membershipTier === "PAID" ? "Pro" : "Free"}
          </dd>
        </div>
        {user.stripeSubscriptionStatus && (
          <div>
            <dt className="text-zinc-500">Subscription</dt>
            <dd className="text-zinc-200">{user.stripeSubscriptionStatus}</dd>
          </div>
        )}
      </dl>

      {user.membershipTier === "PAID" && (
        <section className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="font-semibold text-white">XUI line</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Credentials appear after the first successful Stripe webhook and XUI API call. Each paid
            renewal extends the line when webhooks and XUI are configured.
          </p>
          {user.xuiLineId ? (
            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="text-zinc-500">Line ID</dt>
                <dd className="font-mono text-zinc-200">{user.xuiLineId}</dd>
              </div>
              {user.xuiUsername && (
                <div>
                  <dt className="text-zinc-500">Username</dt>
                  <dd className="font-mono text-zinc-200">{user.xuiUsername}</dd>
                </div>
              )}
              {user.xuiPassword && (
                <div>
                  <dt className="text-zinc-500">Password</dt>
                  <dd className="font-mono text-zinc-200">{user.xuiPassword}</dd>
                </div>
              )}
              {user.xuiExpiresAt && (
                <div>
                  <dt className="text-zinc-500">Approx. renewal target</dt>
                  <dd className="text-zinc-200">{user.xuiExpiresAt.toLocaleString()}</dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="mt-4 text-sm text-amber-200/90">
              No line yet — confirm Stripe webhook delivery and XUI env vars, then complete checkout
              again or contact support.
            </p>
          )}
        </section>
      )}

      <p className="mt-8 text-sm text-zinc-500">
        Manage billing in the{" "}
        <Link href="/membership" className="text-emerald-400 hover:underline">
          membership
        </Link>{" "}
        section (Stripe Customer Portal can be added later).
      </p>
    </div>
  );
}
